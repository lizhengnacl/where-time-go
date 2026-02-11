import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Battery } from "lucide-react";

interface AnalyticsEnergyBalanceProps {
  balance: {
    production: number;
    recovery: number;
    others: number;
  };
}

export const AnalyticsEnergyBalance: React.FC<AnalyticsEnergyBalanceProps> = ({
  balance,
}) => {
  const data = [
    { name: "生产消耗", value: balance.production, color: "hsl(var(--primary))" },
    { name: "能量恢复", value: balance.recovery, color: "hsl(142, 70%, 45%)" },
    { name: "其他日常", value: balance.others, color: "hsl(215, 15%, 50%)" },
  ].filter(d => d.value > 0);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-green-500/10 text-green-500 rounded-lg">
          <Battery size={18} />
        </div>
        <h2 className="text-lg font-bold">能量平衡 (Energy Balance)</h2>
      </div>

      <div className="h-[240px] w-full bg-background border border-border/50 rounded-3xl p-2 shadow-sm flex items-center justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-muted-foreground text-sm italic">暂无足够数据分析能量平衡</div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground px-2 leading-relaxed">
        * 理论支撑：Jim Loehr 的《精力管理》。高效的一天不仅在于产出，更在于产出与恢复（休息、运动）之间的动态平衡。
      </p>
    </section>
  );
};
