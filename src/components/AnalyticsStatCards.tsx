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
        className="p-5 rounded-[2rem] bg-background/40 backdrop-blur-md border border-border/40 flex flex-col items-center justify-center text-center shadow-sm"
      >
        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-2">
          {period === "all"
            ? "累计"
            : period === "custom"
              ? "选定时段"
              : `近${periodDays}日`}
          记录
        </span>
        <div className="text-3xl font-black text-primary flex items-baseline gap-1">
          {totalRecords}
          <span className="text-[10px] font-bold text-primary/60">条</span>
        </div>
      </motion.div>
      <motion.div
        key={`days-${period}-${customRange.start}-${customRange.end}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-[2rem] bg-background/40 backdrop-blur-md border border-border/40 flex flex-col items-center justify-center text-center shadow-sm"
      >
        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-2">
          分析天数
        </span>
        <div className="text-3xl font-black text-foreground/80 flex items-baseline gap-1">
          {periodDays}
          <span className="text-[10px] font-bold text-muted-foreground/60">天</span>
        </div>
      </motion.div>
    </div>
  );
};
