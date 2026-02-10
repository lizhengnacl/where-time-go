/**
 * 时间轴布局组件
 */
import React from "react";
import { ScheduleCard } from "./ScheduleCard";
import { ScheduleItem } from "../context/ScheduleContext";
import { motion } from "framer-motion";

interface TimelineProps {
  items: ScheduleItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  // 辅助函数：判断两个时段的内容和标签是否完全一致
  const isSameContent = (item1: ScheduleItem, item2: ScheduleItem) => {
    return (
      item1.content === item2.content &&
      item1.tags.length === item2.tags.length &&
      item1.tags.every((tag) => item2.tags.includes(tag))
    );
  };

  return (
    <div className="relative space-y-0.5">
      {/* 时间轴装饰线 */}
      <div className="timeline-line" />

      {items.map((item, index) => {
        const prevItem = index > 0 ? items[index - 1] : null;
        const nextItem = index < items.length - 1 ? items[index + 1] : null;

        // 仅在有内容时才进行聚合判断
        const isMergedWithPrev =
          prevItem && item.content && isSameContent(item, prevItem);
        const isMergedWithNext =
          nextItem && item.content && isSameContent(item, nextItem);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.01 }}
            className={`relative ${isMergedWithPrev ? "-mt-0.5" : "pt-2"}`}
          >
            <ScheduleCard
              item={item}
              isMergedTop={isMergedWithPrev || false}
              isMergedBottom={isMergedWithNext || false}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
