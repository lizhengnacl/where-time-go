import React from "react";
import { motion } from "framer-motion";

interface AnalyticsStatCardsProps {
  period: string;
  periodDays: number;
  totalRecords: number;
  customRange: { start: string; end: string };
}

export const AnalyticsStatCards: React.FC<AnalyticsStatCardsProps> = ({
  period,
  periodDays,
  totalRecords,
  customRange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        key={`records-${period}-${customRange.start}-${customRange.end}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center text-center"
      >
        <span className="text-xs text-muted-foreground mb-1">
          {period === "all"
            ? "累计"
            : period === "custom"
              ? "选定时段"
              : `近${periodDays}日`}
          记录
        </span>
        <div className="text-2xl font-bold text-primary">
          {totalRecords}
          <span className="text-xs ml-1 font-normal opacity-70">条</span>
        </div>
      </motion.div>
      <motion.div
        key={`days-${period}-${customRange.start}-${customRange.end}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-3xl bg-secondary/5 border border-secondary/10 flex flex-col items-center justify-center text-center"
      >
        <span className="text-xs text-muted-foreground mb-1">分析天数</span>
        <div className="text-2xl font-bold text-secondary">
          {periodDays}
          <span className="text-xs ml-1 font-normal opacity-70">天</span>
        </div>
      </motion.div>
    </div>
  );
};
