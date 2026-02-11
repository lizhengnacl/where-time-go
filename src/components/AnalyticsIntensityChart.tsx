import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Zap } from "lucide-react";

interface AnalyticsIntensityChartProps {
  hourDist: number[];
}

export const AnalyticsIntensityChart: React.FC<AnalyticsIntensityChartProps> = ({
  hourDist,
}) => {
  const data = hourDist.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, "0")}:00`,
    count,
  }));

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg">
          <Zap size={18} />
        </div>
        <h2 className="text-lg font-bold">全天活跃强度</h2>
      </div>

      <div className="h-[200px] w-full bg-background border border-border/50 rounded-3xl p-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              interval={3}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value} 次记录`, "活跃强度"]}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-muted-foreground px-2">
        * 聚合所有日期的时段活跃度，展现你的全天精力分配曲线。
      </p>
    </section>
  );
};
