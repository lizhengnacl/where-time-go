/**
 * 存储层抽象接口
 * 方便后续从 LocalStorage 扩展到远程 API 存储
 */
import { ScheduleItem, Tag } from "../context/ScheduleContext";

export interface StorageDriver {
  saveHistory(history: Record<string, ScheduleItem[]>): Promise<void>;
  loadHistory(): Promise<Record<string, ScheduleItem[]>>;
  saveCustomTags(tags: Tag[]): Promise<void>;
  loadCustomTags(): Promise<Tag[]>;
}

/**
 * LocalStorage 实现
 */
export const localStorageDriver: StorageDriver = {
  async saveHistory(history) {
    localStorage.setItem("schedule_history", JSON.stringify(history));
  },
  async loadHistory() {
    const saved = localStorage.getItem("schedule_history");
    return saved ? JSON.parse(saved) : {};
  },
  async saveCustomTags(tags) {
    localStorage.setItem("schedule_custom_tags", JSON.stringify(tags));
  },
  async loadCustomTags() {
    const saved = localStorage.getItem("schedule_custom_tags");
    return saved ? JSON.parse(saved) : null;
  },
};

const API_BASE = "/time/api";

/**
 * 辅助函数：获取认证头
 */
function getAuthHeader(): Record<string, string> {
  const userStr = localStorage.getItem("user");
  if (!userStr) return {};
  try {
    const user = JSON.parse(userStr);
    return { Authorization: `Bearer ${user.token}` };
  } catch (e) {
    return {};
  }
}

/**
 * 远端 API 实现
 */
export const apiStorageDriver: StorageDriver = {
  async saveHistory(history) {
    const response = await fetch(`${API_BASE}/schedule/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ history }),
    });
    if (!response.ok) throw new Error("Failed to save history to server");
  },

  async loadHistory() {
    try {
      const response = await fetch(`${API_BASE}/schedule/history`, {
        headers: getAuthHeader(),
      });
      if (response.status === 401) {
        // 游客态不自动重定向
        return {};
      }
      const result = await response.json();
      return result.data || {};
    } catch (error) {
      console.error("Failed to load history from server:", error);
      return {};
    }
  },

  async saveCustomTags(tags) {
    const response = await fetch(`${API_BASE}/schedule/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ tags }),
    });
    if (!response.ok) throw new Error("Failed to save tags to server");
  },

  async loadCustomTags() {
    try {
      const response = await fetch(`${API_BASE}/schedule/tags`, {
        headers: getAuthHeader(),
      });
      if (response.status === 401) {
        // 游客态不自动重定向
        return null;
      }
      const result = await response.json();
      return result.tags || null;
    } catch (error) {
      console.error("Failed to load tags from server:", error);
      return null;
    }
  },
};

/**
 * 同步本地数据到云端（深度合并）
 */
export async function syncLocalToCloud() {
  const localHistory = await localStorageDriver.loadHistory();
  const localTags = await localStorageDriver.loadCustomTags();

  // 加载当前云端数据
  const cloudHistory = await apiStorageDriver.loadHistory();
  const cloudTags = await apiStorageDriver.loadCustomTags();

  // 1. 合并历史记录
  const mergedHistory = { ...cloudHistory };

  Object.entries(localHistory).forEach(([date, localItems]) => {
    if (!mergedHistory[date]) {
      // 云端没有该日期，直接使用本地
      mergedHistory[date] = localItems;
    } else {
      // 云端已有该日期，按小时合并：优先保留有内容的记录
      const cloudItems = mergedHistory[date];
      mergedHistory[date] = cloudItems.map((cItem, index) => {
        const lItem = localItems[index];
        // 如果本地有内容而云端没有，或者本地内容更长/更丰富，可以根据需求调整逻辑
        // 这里简单采用：如果本地有内容，则覆盖云端（因为通常是游客刚记录完想同步）
        if (lItem && lItem.content.trim()) {
          return lItem;
        }
        return cItem;
      });
    }
  });

  // 2. 合并标签
  const mergedTags = Array.from(
    new Set([...(cloudTags || []), ...(localTags || [])]),
  );

  // 3. 保存合并后的数据到云端
  if (Object.keys(mergedHistory).length > 0) {
    await apiStorageDriver.saveHistory(mergedHistory);
  }
  if (mergedTags.length > 0) {
    await apiStorageDriver.saveCustomTags(mergedTags);
  }

  // 同步成功后，清理本地数据以避免下次重复合并
  localStorage.removeItem("schedule_history");
  localStorage.removeItem("schedule_custom_tags");
}

/**
 * 混合存储实现：根据登录状态切换
 */
export const hybridStorageDriver: StorageDriver = {
  async saveHistory(history) {
    if (localStorage.getItem("user")) {
      return apiStorageDriver.saveHistory(history);
    }
    return localStorageDriver.saveHistory(history);
  },
  async loadHistory() {
    if (localStorage.getItem("user")) {
      return apiStorageDriver.loadHistory();
    }
    return localStorageDriver.loadHistory();
  },
  async saveCustomTags(tags) {
    if (localStorage.getItem("user")) {
      return apiStorageDriver.saveCustomTags(tags);
    }
    return localStorageDriver.saveCustomTags(tags);
  },
  async loadCustomTags() {
    if (localStorage.getItem("user")) {
      return apiStorageDriver.loadCustomTags();
    }
    return localStorageDriver.loadCustomTags();
  },
};

// 当前使用的存储驱动
export const storage = hybridStorageDriver;
