import React from "react";
import { BarChart3, XCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell as RechartsCell,
} from "recharts";

interface AnalyticsTrendChartProps {
  dailyTrend: { date: string; fullDate: string; count: number }[];
  period: string;
  drillDown: { type: string; value: any } | null;
  onDrillDown: (filter: { type: "date"; value: string }) => void;
  onClearFilter: () => void;
}

export const AnalyticsTrendChart: React.FC<AnalyticsTrendChartProps> = ({
  dailyTrend,
  period,
  drillDown,
  onDrillDown,
  onClearFilter,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/10 text-purple-500 rounded-lg">
            <BarChart3 size={18} />
          </div>
          <h2 className="text-lg font-bold">记录趋势</h2>
        </div>
        {drillDown?.type === "date" && (
          <button
            onClick={onClearFilter}
            className="text-xs text-primary flex items-center gap-1"
          >
            重置视图 <XCircle size={12} />
          </button>
        )}
      </div>
      <div
        className={`w-full bg-background rounded-3xl border border-border p-4 shadow-sm ${
          period === "all" || period === "custom"
            ? "h-[240px] overflow-x-auto overflow-y-hidden"
            : "h-[200px]"
        }`}
      >
        <div
          className={
            period === "all" || period === "custom"
              ? "min-w-[600px] h-full"
              : "w-full h-full"
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrend}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                style={{ fontSize: "10px" }}
                interval={
                  period === "all" || period === "custom"
                    ? Math.max(0, Math.floor(dailyTrend.length / 8))
                    : 0
                }
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
                labelStyle={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                  color: "hsl(var(--foreground))",
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--background))",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  padding: "8px 12px",
                }}
                formatter={(value: number) => [`${value} 条`, "当日记录"]}
              />
              <Bar
                dataKey="count"
                name="记录数"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                barSize={period === "all" || period === "custom" ? 12 : 20}
                onClick={(data) => {
                  if (data && data.fullDate) {
                    onDrillDown({ type: "date", value: data.fullDate });
                  }
                }}
                className="cursor-pointer"
              >
                {dailyTrend.map((entry, index) => (
                  <RechartsCell
                    key={`cell-${index}`}
                    opacity={
                      drillDown?.type === "date" &&
                      drillDown.value !== entry.fullDate
                        ? 0.3
                        : 1
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};
