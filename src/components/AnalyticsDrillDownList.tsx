import React from "react";
import { Coffee, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { ScheduleItem } from "../context/ScheduleContext";

interface AnalyticsDrillDownListProps {
  drillDown: { type: string; value: any } | null;
  filteredRecords: { date: string; item: ScheduleItem }[];
  onJumpToRecord: (date: string) => void;
  detailRef: React.RefObject<HTMLDivElement>;
}

export const AnalyticsDrillDownList: React.FC<AnalyticsDrillDownListProps> = ({
  drillDown,
  filteredRecords,
  onJumpToRecord,
  detailRef,
}) => {
  if (!drillDown) return null;

  const formatHour = (h: number) => `${h.toString().padStart(2, "0")}:00`;

  return (
    <motion.section
      ref={detailRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 pt-4 border-t border-border"
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
          <Calendar size={18} />
        </div>
        <h2 className="text-lg font-bold">详细记录回顾</h2>
        <span className="text-xs text-muted-foreground ml-auto">
          找到 {filteredRecords.length} 条相关记录
        </span>
      </div>

      <div className="space-y-3">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record, i) => (
            <div
              key={`${record.date}-${record.item.hour}-${i}`}
              onClick={() => onJumpToRecord(record.date)}
              className="group p-4 rounded-3xl bg-secondary/20 border border-transparent hover:border-primary/20 hover:bg-background transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-primary/60">
                  <Calendar size={10} />
                  {record.date}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                  <Clock size={10} />
                  {formatHour(record.item.hour)}
                </div>
              </div>
              <p className="text-sm font-medium mb-2 leading-relaxed">
                {record.item.content}
              </p>
              <div className="flex flex-wrap gap-1">
                {record.item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-background/80 text-muted-foreground text-[9px] font-bold border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-40">
            <Coffee size={32} />
            <p className="text-sm font-medium">暂无匹配记录</p>
          </div>
        )}
      </div>
    </motion.section>
  );
};
