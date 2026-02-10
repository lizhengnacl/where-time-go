import React from "react";
import { Zap, Clock, Target, XCircle } from "lucide-react";

interface AnalyticsGoldenHoursProps {
  goldenHours: { hour: number; count: number }[];
  drillDown: { type: string; value: any } | null;
  onDrillDown: (filter: { type: "hour"; value: number }) => void;
  onClearFilter: () => void;
}

export const AnalyticsGoldenHours: React.FC<AnalyticsGoldenHoursProps> = ({
  goldenHours,
  drillDown,
  onDrillDown,
  onClearFilter,
}) => {
  const formatHour = (h: number) => `${h.toString().padStart(2, "0")}:00`;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg">
            <Zap size={18} />
          </div>
          <h2 className="text-lg font-bold">黄金效率时段</h2>
        </div>
        {drillDown?.type === "hour" && (
          <button
            onClick={onClearFilter}
            className="text-xs text-primary flex items-center gap-1"
          >
            重置视图 <XCircle size={12} />
          </button>
        )}
      </div>

      {goldenHours.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {goldenHours.map((h, i) => (
            <div
              key={h.hour}
              onClick={() => onDrillDown({ type: "hour", value: h.hour })}
              className={`flex items-center gap-4 p-4 rounded-3xl border transition-all cursor-pointer
                ${
                  drillDown?.type === "hour" && drillDown.value === h.hour
                    ? "bg-orange-500/10 border-orange-500/30 ring-1 ring-orange-500/20"
                    : "bg-background border-border hover:border-orange-500/30 hover:bg-orange-500/5"
                }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0
                ${i === 0 ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-orange-500/10 text-orange-600"}`}
              >
                <Clock size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">
                    {formatHour(h.hour)} - {formatHour(h.hour + 1)}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 uppercase">
                    Top {i + 1}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  在此期间保持了最高的工作效率
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground">
            <Target size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              暂无效率数据
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              多记录一些工作/学习活动来解锁分析
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
