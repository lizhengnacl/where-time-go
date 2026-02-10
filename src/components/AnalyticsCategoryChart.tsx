import React from "react";
import { PieChart as PieIcon, XCircle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Tag } from "../context/ScheduleContext";

interface AnalyticsCategoryChartProps {
  pieData: { name: string; value: number }[];
  drillDown: { type: string; value: any } | null;
  onDrillDown: (filter: { type: "tag"; value: Tag }) => void;
  onClearFilter: () => void;
  renderCustomizedLabel: (props: any) => React.ReactNode;
  getTagColor: (tag: string) => string;
}

export const AnalyticsCategoryChart: React.FC<AnalyticsCategoryChartProps> = ({
  pieData,
  drillDown,
  onDrillDown,
  onClearFilter,
  renderCustomizedLabel,
  getTagColor,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg">
            <PieIcon size={18} />
          </div>
          <h2 className="text-lg font-bold">时间分配占比</h2>
        </div>
        {drillDown?.type === "tag" && (
          <button
            onClick={onClearFilter}
            className="text-xs text-primary flex items-center gap-1"
          >
            清除筛选 <XCircle size={12} />
          </button>
        )}
      </div>
      <div className="h-[280px] w-full bg-background rounded-3xl border border-border p-4 shadow-sm relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
              onClick={(data) => {
                if (data && data.name) {
                  onDrillDown({ type: "tag", value: data.name as Tag });
                }
              }}
              className="cursor-pointer"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getTagColor(entry.name)}
                  stroke={
                    drillDown?.type === "tag" &&
                    drillDown.value === entry.name
                      ? "hsl(var(--primary))"
                      : "none"
                  }
                  strokeWidth={2}
                  style={{ outline: "none" }}
                  opacity={
                    drillDown?.type === "tag" &&
                    drillDown.value !== entry.name
                      ? 0.3
                      : 1
                  }
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--background))",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "8px 12px",
                fontSize: "12px",
                color: "hsl(var(--foreground))",
              }}
              itemStyle={{
                color: "hsl(var(--foreground))",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
              分类占比
            </div>
            <div className="text-xs font-bold text-primary mt-1">
              点击筛选
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
