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
import { Calendar } from "lucide-react";

interface AnalyticsWeeklyRhythmProps {
  weekdayData: { name: string; avg: number; isWeekend: boolean }[];
}

export const AnalyticsWeeklyRhythm: React.FC<AnalyticsWeeklyRhythmProps> = ({
  weekdayData,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg">
          <Calendar size={18} />
        </div>
        <h2 className="text-lg font-bold">周内节律</h2>
      </div>

      <div className="h-[240px] w-full bg-background border border-border/50 rounded-3xl p-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekdayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
              formatter={(value: number) => [`${value} 次记录`, "平均记录数"]}
            />
            <Bar dataKey="avg" radius={[6, 6, 0, 0]} barSize={24}>
              {weekdayData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isWeekend ? "hsl(var(--primary)/0.6)" : "hsl(var(--primary))"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-muted-foreground px-2">
        * 展示每周各天的平均记录活跃度，浅色柱状图代表周末。
      </p>
    </section>
  );
};
