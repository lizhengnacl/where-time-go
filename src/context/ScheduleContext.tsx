/**
 * 日程数据状态管理上下文
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import { storage } from "../lib/storage";

export type Tag = string;

export interface ScheduleItem {
  id: string;
  hour: number;
  content: string;
  tags: Tag[];
}

interface ScheduleContextType {
  items: ScheduleItem[];
  history: Record<string, ScheduleItem[]>;
  currentDate: string;
  customTags: Tag[];
  setCurrentDate: (date: string) => void;
  updateItem: (hour: number, content: string, tags: Tag[]) => void;
  batchUpdateItems: (
    updates: { hour: number; content: string; tags: Tag[] }[],
  ) => void;
  addCustomTag: (tag: Tag) => void;
  stats: Record<Tag, number>;
  getHistoryDates: () => string[];
}

const DEFAULT_TAGS: Tag[] = ["工作", "学习", "休息", "运动", "其他"];

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined,
);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [customTags, setCustomTags] = useState<Tag[]>(DEFAULT_TAGS);
  const [history, setHistory] = useState<Record<string, ScheduleItem[]>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const isFirstRender = React.useRef(true);

  // 初始化加载数据
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      setIsLoaded(true);
      return;
    }

    const initData = async () => {
      try {
        const [savedHistory, savedTags] = await Promise.all([
          storage.loadHistory(),
          storage.loadCustomTags(),
        ]);

        if (savedHistory && Object.keys(savedHistory).length > 0) {
          setHistory(savedHistory);
        }
        if (savedTags) setCustomTags(savedTags);
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    initData();
  }, []);

  const items =
    history[currentDate] ||
    Array.from({ length: 24 }, (_, i) => ({
      id: `hour-${currentDate}-${i}`,
      hour: i,
      content: "",
      tags: [],
    }));

  // 数据持久化
  useEffect(() => {
    if (!isLoaded || !localStorage.getItem("user")) return;

    // 跳过加载后的第一次自动保存，只有当 history 真正改变时才保存
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      storage.saveHistory(history);
    }, 500); // 添加防抖，避免频繁写入

    return () => clearTimeout(timer);
  }, [history, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !localStorage.getItem("user")) return;

    // 标签也添加同样的逻辑
    storage.saveCustomTags(customTags);
  }, [customTags, isLoaded]);

  const addCustomTag = (tag: Tag) => {
    if (tag && !customTags.includes(tag)) {
      setCustomTags((prev) => [...prev, tag]);
    }
  };

  const updateItem = (hour: number, content: string, tags: Tag[]) => {
    setHistory((prev) => {
      const dayItems =
        prev[currentDate] ||
        Array.from({ length: 24 }, (_, i) => ({
          id: `hour-${currentDate}-${i}`,
          hour: i,
          content: "",
          tags: [],
        }));

      const newDayItems = dayItems.map((item) =>
        item.hour === hour ? { ...item, content, tags } : item,
      );

      return { ...prev, [currentDate]: newDayItems };
    });
  };

  const batchUpdateItems = (
    updates: { hour: number; content: string; tags: Tag[] }[],
  ) => {
    setHistory((prev) => {
      const dayItems =
        prev[currentDate] ||
        Array.from({ length: 24 }, (_, i) => ({
          id: `hour-${currentDate}-${i}`,
          hour: i,
          content: "",
          tags: [],
        }));

      const updateMap = new Map(updates.map((u) => [u.hour, u]));
      const newDayItems = dayItems.map((item) => {
        const update = updateMap.get(item.hour);
        return update
          ? { ...item, content: update.content, tags: update.tags }
          : item;
      });

      return { ...prev, [currentDate]: newDayItems };
    });
  };

  const stats = items.reduce(
    (acc, item) => {
      item.tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    },
    {} as Record<Tag, number>,
  );

  const getHistoryDates = () => {
    const dates = Object.keys(history).sort((a, b) => b.localeCompare(a));
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (!dates.includes(today)) {
      return [today, ...dates];
    }
    return dates;
  };

  if (!isLoaded) return null;

  return (
    <ScheduleContext.Provider
      value={{
        items,
        history,
        currentDate,
        customTags,
        setCurrentDate,
        updateItem,
        batchUpdateItems,
        addCustomTag,
        stats,
        getHistoryDates,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context)
    throw new Error("useSchedule must be used within a ScheduleProvider");
  return context;
};
