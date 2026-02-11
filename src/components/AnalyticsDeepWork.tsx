import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Brain } from "lucide-react";

interface AnalyticsDeepWorkProps {
  sessions: number[];
}

export const AnalyticsDeepWork: React.FC<AnalyticsDeepWorkProps> = ({
  sessions,
}) => {
  // 处理数据：统计 1h, 2h, 3h, 4h+ 的 session 数量
  const distribution = [
    { name: "1h", count: 0 },
    { name: "2h", count: 0 },
    { name: "3h", count: 0 },
    { name: "4h+", count: 0 },
  ];

  sessions.forEach((s) => {
    if (s === 1) distribution[0].count++;
    else if (s === 2) distribution[1].count++;
    else if (s === 3) distribution[2].count++;
    else if (s >= 4) distribution[3].count++;
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-purple-500/10 text-purple-500 rounded-lg">
          <Brain size={18} />
        </div>
        <h2 className="text-lg font-bold">专注深度分布</h2>
      </div>

      <div className="h-[200px] w-full bg-background border border-border/50 rounded-3xl p-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted)/0.5)" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value} 次`, "连续专注"]}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={32}>
              {distribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index >= 2 ? "hsl(270, 70%, 60%)" : "hsl(270, 40%, 75%)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-muted-foreground px-2 leading-relaxed">
        * 依据 Cal Newport 的《深度工作》理论，连续 2 小时以上的专注能产生极高的认知产出。
      </p>
    </section>
  );
};
