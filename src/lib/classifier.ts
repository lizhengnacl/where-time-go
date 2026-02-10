/**
 * 标签推荐分类器抽象接口
 * 支持本地规则匹配和远端 AI 语义识别切换
 */
import { Tag } from "../context/ScheduleContext";

export interface ClassifierDriver {
  getRecommendations(
    text: string,
    currentTags: Tag[],
    excludeTags?: Tag[],
  ): Promise<Tag[]>;
}

// 本地推荐规则
const AI_KEYWORDS: Record<string, Tag[]> = {
  "写代码|开发|程序|bug|编程|git|代码": ["工作", "学习"],
  "开会|会议|沟通|同步|汇报|日报": ["工作"],
  "读书|看书|网课|学习|笔记|背单词": ["学习"],
  "健身|跑步|运动|游泳|瑜伽|打球": ["运动"],
  "睡觉|休息|午睡|发呆|冥想": ["休息"],
  "吃饭|早餐|午餐|晚餐|零食|下午茶": ["其他", "休息"],
  "游戏|电影|刷剧|短视频|玩": ["其他", "休息"],
};

/**
 * 本地规则驱动
 */
export const localClassifierDriver: ClassifierDriver = {
  async getRecommendations(text, currentTags, excludeTags = []) {
    if (!text) return [];
    const recommended = new Set<Tag>();
    Object.entries(AI_KEYWORDS).forEach(([pattern, tags]) => {
      if (new RegExp(pattern, "i").test(text)) {
        tags.forEach((t) => recommended.add(t));
      }
    });
    return Array.from(recommended).filter((t) => !excludeTags.includes(t));
  },
};

const API_BASE = "/time/api";

/**
 * 远端 AI 驱动 (预留)
 */
export const apiClassifierDriver: ClassifierDriver = {
  async getRecommendations(text, currentTags, excludeTags = []) {
    try {
      const response = await fetch(`${API_BASE}/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, excludeTags }),
      });
      const result = await response.json();

      let rawCategories: string[] = [];
      if (Array.isArray(result.categories)) {
        rawCategories = result.categories;
      } else if (typeof result.category === "string") {
        rawCategories = [result.category];
      }

      if (rawCategories.length > 0) {
        // 归一化处理以确保过滤准确
        const normalize = (s: string) =>
          s
            .trim()
            .toLowerCase()
            .replace(/[。.！!]/g, "");
        const normalizedCurrent = currentTags.map(normalize);
        const normalizedExcluded = (excludeTags || []).map(normalize);

        const filtered = rawCategories
          .map((tag) => tag.trim())
          .filter((tag) => {
            const normalizedTag = normalize(tag);
            return (
              tag.length > 0 && !normalizedExcluded.includes(normalizedTag)
            );
          });

        // 返回前 2 个最相关的推荐，增加展示机会
        return filtered.slice(0, 2);
      }
      return [];
    } catch (error) {
      console.error("Failed to get recommendations from AI server:", error);
      return [];
    }
  },
};

// 当前使用的分类器驱动
// export const classifier = localClassifierDriver;
export const classifier = apiClassifierDriver;
