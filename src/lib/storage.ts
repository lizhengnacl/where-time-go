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
        localStorage.removeItem("user");
        if (!window.location.pathname.endsWith("/login")) {
          window.location.href = "/time/login";
        }
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
        localStorage.removeItem("user");
        if (!window.location.pathname.endsWith("/login")) {
          window.location.href = "/time/login";
        }
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

// 当前使用的存储驱动（切换为 apiStorageDriver 即可连接后端）
// export const storage = localStorageDriver;
export const storage = apiStorageDriver;
