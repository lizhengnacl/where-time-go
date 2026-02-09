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
  const [currentDate, setCurrentDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [customTags, setCustomTags] = useState<Tag[]>(DEFAULT_TAGS);
  const [history, setHistory] = useState<Record<string, ScheduleItem[]>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // 初始化加载数据
  useEffect(() => {
    const initData = async () => {
      const [savedHistory, savedTags] = await Promise.all([
        storage.loadHistory(),
        storage.loadCustomTags(),
      ]);

      if (savedHistory) setHistory(savedHistory);
      if (savedTags) setCustomTags(savedTags);
      setIsLoaded(true);
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
    if (isLoaded) {
      storage.saveHistory(history);
    }
  }, [history, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      storage.saveCustomTags(customTags);
    }
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
    const today = new Date().toISOString().split("T")[0];
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
