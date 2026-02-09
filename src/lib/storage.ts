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

/**
 * 远端 API 实现
 */
export const apiStorageDriver: StorageDriver = {
  async saveHistory(history) {
    const response = await fetch("/api/schedule/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history }),
    });
    if (!response.ok) throw new Error("Failed to save history to server");
  },

  async loadHistory() {
    try {
      const response = await fetch("/api/schedule/history");
      const result = await response.json();
      return result.data || {};
    } catch (error) {
      console.error("Failed to load history from server:", error);
      return {};
    }
  },

  async saveCustomTags(tags) {
    const response = await fetch("/api/schedule/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
    if (!response.ok) throw new Error("Failed to save tags to server");
  },

  async loadCustomTags() {
    try {
      const response = await fetch("/api/schedule/tags");
      const result = await response.json();
      return result.tags || null;
    } catch (error) {
      console.error("Failed to load tags from server:", error);
      return null;
    }
  },
};

// 当前使用的存储驱动（切换为 apiStorageDriver 即可连接后端）
export const storage = localStorageDriver;
