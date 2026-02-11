/**
 * 可视化分析页面
 * 基于记录数据提供多维度的时间分布分析与时间管理建议
 */
import React, { useMemo, useState, useRef } from "react";
import { useSchedule, Tag, ScheduleItem } from "../context/ScheduleContext";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  BarChart3,
  PieChart as PieIcon,
  Zap,
  Target,
  Coffee,
  Calendar,
  Clock,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnalyticsStatCards } from "../components/AnalyticsStatCards";
import { AnalyticsCategoryChart } from "../components/AnalyticsCategoryChart";
import { AnalyticsTrendChart } from "../components/AnalyticsTrendChart";
import { AnalyticsGoldenHours } from "../components/AnalyticsGoldenHours";
import { AnalyticsWeeklyRhythm } from "../components/AnalyticsWeeklyRhythm";
import { AnalyticsIntensityChart } from "../components/AnalyticsIntensityChart";
import { AnalyticsDeepWork } from "../components/AnalyticsDeepWork";
import { AnalyticsEnergyBalance } from "../components/AnalyticsEnergyBalance";
import { AnalyticsDrillDownList } from "../components/AnalyticsDrillDownList";
import { Cloud, Info } from "lucide-react";

const TAG_COLORS: Record<string, string> = {
  工作: "hsl(var(--primary))",
  学习: "hsl(270, 70%, 60%)",
  休息: "hsl(142, 70%, 45%)",
  运动: "hsl(24, 90%, 50%)",
  其他: "hsl(215, 15%, 50%)",
};

const getTagColor = (tag: string) => {
  if (TAG_COLORS[tag]) return TAG_COLORS[tag];
  // 为自定义标签生成稳定颜色
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`;
};

type DrillDownFilter =
  | { type: "tag"; value: Tag }
  | { type: "date"; value: string }
  | { type: "hour"; value: number };

type Period = "today" | "7d" | "30d" | "all" | "custom";

export const Analytics: React.FC = () => {
  const {
    history,
    items: currentItems,
    currentDate: currentContextDate,
    setCurrentDate,
  } = useSchedule();
  const navigate = useNavigate();
  const [drillDown, setDrillDown] = useState<DrillDownFilter | null>(null);
  const [period, setPeriod] = useState<Period>("today");

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => formatDate(new Date()), []);

  // 统一数据源：合并历史数据和当前内存中的实时数据
  const fullHistory = useMemo(() => {
    const combined = { ...history };
    // 只有当上下文日期是今天时，才用内存中的 currentItems 覆盖历史，保证实时性
    if (currentContextDate === todayStr) {
      combined[todayStr] = currentItems;
    }
    return combined;
  }, [history, currentItems, currentContextDate, todayStr]);

  const [customRange, setCustomRange] = useState({
    start: formatDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
    end: todayStr,
  });
  const detailRef = useRef<HTMLDivElement>(null);

  const targetDates = useMemo(() => {
    const allDates = Object.keys(fullHistory).sort((a, b) =>
      b.localeCompare(a),
    );
    // 确保 history 中即使没有今天的 key，也能在选择 today 时包含它
    const datesWithToday = allDates.includes(todayStr)
      ? allDates
      : [todayStr, ...allDates].sort((a, b) => b.localeCompare(a));

    if (period === "today") return [todayStr];
    if (period === "7d") return datesWithToday.slice(0, 7);
    if (period === "30d") return datesWithToday.slice(0, 30);
    if (period === "custom") {
      return datesWithToday.filter(
        (date) => date >= customRange.start && date <= customRange.end,
      );
    }
    return datesWithToday;
  }, [fullHistory, period, customRange, todayStr]);

  const isGuest = !localStorage.getItem("user");

  // 数据聚合：基于选择的时间段
  const analysisData = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    const dailyTrend: { date: string; fullDate: string; count: number }[] = [];
    const hourDist = Array(24).fill(0);
    const hourDistAll = Array(24).fill(0);
    const weekdayActivity = Array(7)
      .fill(0)
      .map(() => ({ count: 0, days: 0 }));

    // 理论支撑：Deep Work (Cal Newport) - 连续专注时长统计
    const deepWorkSessions: number[] = []; // 存储每次连续专注的小时数

    // 理论支撑：能量管理 (Jim Loehr) - 生产力 vs 恢复活动配比
    const energyBalance = {
      production: 0, // 工作、学习
      recovery: 0, // 休息、运动
      others: 0, // 其他
    };

    const dayToWeekday = (dateStr: string) => {
      const date = new Date(dateStr);
      return (date.getDay() + 6) % 7; // 0-6 represents Mon-Sun
    };

    const processedDays = new Set<string>();

    targetDates.forEach((date) => {
      const dayItems = fullHistory[date] || [];
      let dayCount = 0;
      const weekdayIdx = dayToWeekday(date);
      if (!processedDays.has(date)) {
        weekdayActivity[weekdayIdx].days++;
        processedDays.add(date);
      }

      let currentDeepWorkStreak = 0;

      dayItems.forEach((item) => {
        if (item.content) {
          dayCount++;
          weekdayActivity[weekdayIdx].count++;
          hourDistAll[item.hour]++;
          // 统计所有标签的频次
          item.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;

            // 能量平衡统计
            if (tag === "工作" || tag === "学习") energyBalance.production++;
            else if (tag === "休息" || tag === "运动") energyBalance.recovery++;
            else energyBalance.others++;
          });

          // 黄金效率时段统计逻辑：
          // 判定为“生产力”时段的标准：
          // 仅统计显式包含“工作”或“学习”标签的时段
          const isProductive = item.tags.some(
            (tag) => tag === "工作" || tag === "学习",
          );

          if (isProductive) {
            hourDist[item.hour]++;
            currentDeepWorkStreak++;
          } else {
            if (currentDeepWorkStreak > 0) {
              deepWorkSessions.push(currentDeepWorkStreak);
              currentDeepWorkStreak = 0;
            }
          }
        } else {
          if (currentDeepWorkStreak > 0) {
            deepWorkSessions.push(currentDeepWorkStreak);
            currentDeepWorkStreak = 0;
          }
        }
      });

      // 处理跨天结束的 streak
      if (currentDeepWorkStreak > 0) {
        deepWorkSessions.push(currentDeepWorkStreak);
      }

      dailyTrend.unshift({
        date: date.split("-").slice(1).join("/"),
        fullDate: date,
        count: dayCount,
      });
    });

    const weekdayNames = [
      "周一",
      "周二",
      "周三",
      "周四",
      "周五",
      "周六",
      "周日",
    ];
    const weekdayData = weekdayActivity.map((item, idx) => ({
      name: weekdayNames[idx],
      avg: item.days > 0 ? Number((item.count / item.days).toFixed(1)) : 0,
      isWeekend: idx >= 5,
    }));

    const pieData = Object.entries(tagCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // 优化黄金时段提取逻辑
    const allProductiveHours = hourDist
      .map((count, hour) => ({ hour, count }))
      .filter((h) => h.count > 0)
      .sort((a, b) => b.count - a.count || a.hour - b.hour);

    // 提取黄金时段：严格保留频次最高的前 3 名（TOP3）
    const goldenHours: { hour: number; count: number }[] =
      allProductiveHours.slice(0, 3);

    // 计算生产力占比 (工作+学习 vs 总计)
    const productiveCount = (tagCounts["工作"] || 0) + (tagCounts["学习"] || 0);
    const totalTagCount = Object.values(tagCounts).reduce((a, b) => a + b, 0);
    const productivityRatio =
      totalTagCount > 0 ? (productiveCount / totalTagCount) * 100 : 0;

    return {
      pieData,
      dailyTrend,
      goldenHours,
      weekdayData,
      hourDistAll,
      productivityRatio,
      deepWorkSessions,
      energyBalance,
      totalRecords: dailyTrend.reduce((acc, curr) => acc + curr.count, 0),
      periodDays: targetDates.length,
    };
  }, [fullHistory, targetDates, period]);

  // 根据筛选条件获取具体记录
  const filteredRecords = useMemo(() => {
    if (!drillDown) return [];

    const records: { date: string; item: ScheduleItem }[] = [];
    targetDates.forEach((date) => {
      const items = fullHistory[date] || [];
      items.forEach((item) => {
        if (!item.content) return;

        let match = false;
        if (drillDown.type === "tag" && item.tags.includes(drillDown.value))
          match = true;
        if (drillDown.type === "date" && date === drillDown.value) match = true;
        if (drillDown.type === "hour" && item.hour === drillDown.value)
          match = true;

        if (match) {
          records.push({ date, item });
        }
      });
    });

    // 按日期倒序，同日期按小时升序
    return records.sort(
      (a, b) => b.date.localeCompare(a.date) || a.item.hour - b.item.hour,
    );
  }, [fullHistory, drillDown, targetDates]);

  const handleDrillDown = (filter: DrillDownFilter) => {
    setDrillDown(filter);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleJumpToRecord = (date: string) => {
    setCurrentDate(date);
    navigate("/");
  };

  // 渲染饼图自定义标签
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 2.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // 只有占比大于 2% 的才展示标签，避免太拥挤
    if (percent < 0.02) return null;

    return (
      <text
        x={x}
        y={y}
        fill="currentColor"
        className="text-[10px] font-medium opacity-80"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-background flex flex-col pb-10 shadow-2xl border-x border-border/50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="glass-panel sticky top-0 z-20 px-6 py-4 flex items-center justify-between border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-all active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-black bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            时间洞察
          </h1>
        </div>
      </div>

      <div className="p-6 space-y-10 relative z-10">
        {/* 游客模式云同步提示 */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-3"
          >
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
              <Info size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-700/80 mb-0.5">
                当前为本地访客模式
              </p>
              <p className="text-[10px] text-amber-600/60 leading-relaxed font-medium">
                数据仅保存在此浏览器中，登录后可享受多端同步。
              </p>
            </div>
          </motion.div>
        )}

        {/* 时间跨度选择 */}
        <div className="space-y-4">
          <div className="flex p-1.5 bg-muted/30 backdrop-blur-sm rounded-[1.5rem] border border-border/20">
            {(["today", "7d", "30d", "all", "custom"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2 text-[11px] font-black rounded-2xl transition-all tracking-wider ${
                  period === p
                    ? "bg-background shadow-md text-primary ring-1 ring-black/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "today"
                  ? "今日"
                  : p === "7d"
                    ? "近7日"
                    : p === "30d"
                      ? "近30日"
                      : p === "all"
                        ? "累计"
                        : "自定义"}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {period === "custom" && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-[2rem] border border-border/40">
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground/60 ml-2">
                      开始日期
                    </span>
                    <input
                      type="date"
                      value={customRange.start}
                      onChange={(e) =>
                        setCustomRange({
                          ...customRange,
                          start: e.target.value,
                        })
                      }
                      max={customRange.end}
                      className="w-full bg-background/50 border border-border/40 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="w-4 h-px bg-border/60 mt-4" />
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground/60 ml-2">
                      结束日期
                    </span>
                    <input
                      type="date"
                      value={customRange.end}
                      onChange={(e) =>
                        setCustomRange({ ...customRange, end: e.target.value })
                      }
                      min={customRange.start}
                      max={todayStr}
                      className="w-full bg-background/50 border border-border/40 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 核心摘要 */}
        <AnalyticsStatCards
          period={period}
          periodDays={analysisData.periodDays}
          totalRecords={analysisData.totalRecords}
          customRange={customRange}
        />

        {/* 1. 分类占比 */}
        <AnalyticsCategoryChart
          pieData={analysisData.pieData}
          drillDown={drillDown}
          onDrillDown={handleDrillDown}
          onClearFilter={() => setDrillDown(null)}
          renderCustomizedLabel={renderCustomizedLabel}
          getTagColor={getTagColor}
        />

        {/* 2. 活跃趋势 */}
        <AnalyticsTrendChart
          dailyTrend={analysisData.dailyTrend}
          period={period}
          drillDown={drillDown}
          onDrillDown={handleDrillDown}
          onClearFilter={() => setDrillDown(null)}
        />

        {/* 3. 周内节律 */}
        <AnalyticsWeeklyRhythm weekdayData={analysisData.weekdayData} />

        {/* 4. 全天活跃强度 */}
        <AnalyticsIntensityChart hourDist={analysisData.hourDistAll} />

        {/* 5. 专注深度 (Deep Work) */}
        <AnalyticsDeepWork sessions={analysisData.deepWorkSessions} />

        {/* 6. 能量平衡 (Energy Balance) */}
        <AnalyticsEnergyBalance balance={analysisData.energyBalance} />

        {/* 7. 黄金时间洞察 */}
        <AnalyticsGoldenHours
          goldenHours={analysisData.goldenHours}
          drillDown={drillDown}
          onDrillDown={handleDrillDown}
          onClearFilter={() => setDrillDown(null)}
        />

        {/* 5. 详细记录回顾 */}
        <AnalyticsDrillDownList
          drillDown={drillDown}
          filteredRecords={filteredRecords}
          onJumpToRecord={handleJumpToRecord}
          detailRef={detailRef}
        />

        {/* 8. 洞察与建议 */}
        <section className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-4">
          <h3 className="font-bold flex items-center gap-2 text-lg">
            <Coffee size={20} className="text-primary" />
            时光洞察
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-background/50 p-4 rounded-2xl border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  生产力分布
                </span>
                <span className="text-sm font-black text-primary">
                  {analysisData.productivityRatio.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisData.productivityRatio}%` }}
                  className="bg-primary h-full"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                {analysisData.productivityRatio > 50
                  ? "太棒了！你的大部分时间都投入在了核心产出上，请继续保持这种专注。"
                  : "目前非工作/学习类事务占据了较多时间，建议检查是否有可以优化的碎片化时段。"}
              </p>
            </div>

            <div className="space-y-3 px-1">
              {/* Deep Work Insight */}
              {analysisData.deepWorkSessions.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    你的最长连续专注时间为{" "}
                    <span className="text-foreground font-bold">
                      {Math.max(...analysisData.deepWorkSessions)} 小时
                    </span>
                    。
                    {Math.max(...analysisData.deepWorkSessions) >= 2
                      ? "这符合深度工作理论，长时段的专注能极大地提升任务完成质量。"
                      : "建议尝试将碎片化的工作合并，通过至少 90 分钟的连续时段来进入深度工作状态。"}
                  </p>
                </div>
              )}

              {/* Energy Balance Insight */}
              <div className="flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  当前的能量配比为{" "}
                  <span className="text-foreground font-bold">
                    {analysisData.energyBalance.production} (消耗) :{" "}
                    {analysisData.energyBalance.recovery} (恢复)
                  </span>
                  。
                  {analysisData.energyBalance.production >
                  analysisData.energyBalance.recovery * 3
                    ? "注意：生产消耗远大于能量恢复，建议增加主动休息，防止认知疲劳。"
                    : "你的能量管理非常平衡，这有助于保持长期的稳定产出。"}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  你的记录活跃度在{" "}
                  <span className="text-foreground font-bold">
                    {
                      analysisData.weekdayData.sort((a, b) => b.avg - a.avg)[0]
                        ?.name
                    }
                  </span>{" "}
                  达到顶峰，这是你状态最好的日子。
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysisData.goldenHours.length > 0
                    ? `你的黄金效率时段集中在 ${analysisData.goldenHours.map((h) => `${h.hour}:00`).join("、")}，建议将最难的任务安排在这些时段。`
                    : "继续记录更多数据，AI 将为你揭示最适合你的高效时段。"}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  你的全天活跃强度呈现{" "}
                  <span className="text-foreground font-bold">
                    {analysisData.hourDistAll.indexOf(
                      Math.max(...analysisData.hourDistAll),
                    )}
                    :00
                  </span>{" "}
                  附近的分布，建议根据此规律优化精力分配。
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
