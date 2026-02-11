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
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-2xl shadow-sm border border-blue-500/5">
            <PieIcon size={18} />
          </div>
          <h2 className="text-lg font-black tracking-tight">时间分配占比</h2>
        </div>
        {drillDown?.type === "tag" && (
          <button
            onClick={onClearFilter}
            className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center gap-1.5 transition-all hover:bg-primary/20 active:scale-95"
          >
            清除筛选 <XCircle size={12} />
          </button>
        )}
      </div>
      <div className="h-[300px] w-full bg-background/40 backdrop-blur-md rounded-[2.5rem] border border-border/40 p-6 shadow-sm relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={8}
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
              onClick={(data) => {
                if (data && data.name) {
                  onDrillDown({ type: "tag", value: data.name as Tag });
                }
              }}
              className="cursor-pointer focus:outline-none"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getTagColor(entry.name)}
                  stroke={
                    drillDown?.type === "tag" &&
                    drillDown.value === entry.name
                      ? "hsl(var(--primary))"
                      : "transparent"
                  }
                  strokeWidth={3}
                  style={{ outline: "none" }}
                  opacity={
                    drillDown?.type === "tag" &&
                    drillDown.value !== entry.name
                      ? 0.2
                      : 1
                  }
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "20px",
                border: "1px solid hsl(var(--border)/0.4)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
                padding: "10px 16px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
              itemStyle={{
                color: "hsl(var(--foreground))",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
