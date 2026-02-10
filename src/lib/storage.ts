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
 * 同步本地数据到云端
 */
export async function syncLocalToCloud() {
  const localHistory = await localStorageDriver.loadHistory();
  const localTags = await localStorageDriver.loadCustomTags();

  if (Object.keys(localHistory).length > 0) {
    await apiStorageDriver.saveHistory(localHistory);
  }
  if (localTags && localTags.length > 0) {
    await apiStorageDriver.saveCustomTags(localTags);
  }

  // 同步完成后清除本地数据（可选，或者保留作为备份，这里选择保留但后续优先用云端）
  // localStorage.removeItem("schedule_history");
  // localStorage.removeItem("schedule_custom_tags");
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
