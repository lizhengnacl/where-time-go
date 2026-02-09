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

// 当前使用的存储驱动
export const storage = localStorageDriver;
