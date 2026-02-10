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

    targetDates.forEach((date) => {
      const dayItems = fullHistory[date] || [];
      let dayCount = 0;
      dayItems.forEach((item) => {
        if (item.content) {
          dayCount++;
          // 统计所有标签的频次
          item.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });

          // 黄金效率时段统计逻辑：
          // 判定为“生产力”时段的标准：
          // 1. 显式包含“工作”或“学习”标签
          // 2. 或者包含用户自定义的标签（非“休息”、“其他”等系统默认非生产力标签）
          const nonProductiveTags = ["休息", "其他"];
          const isProductive = item.tags.some(
            (tag) =>
              tag === "工作" ||
              tag === "学习" ||
              !nonProductiveTags.includes(tag),
          );

          if (isProductive) {
            hourDist[item.hour]++;
          }
        }
      });
      dailyTrend.unshift({
        date: date.split("-").slice(1).join("/"),
        fullDate: date,
        count: dayCount,
      });
    });

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

    return {
      pieData,
      dailyTrend,
      goldenHours,
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
    <div className="max-w-md mx-auto min-h-screen bg-background flex flex-col pb-10">
      {/* Header */}
      <div className="glass-panel sticky top-0 z-20 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">时间洞察</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* 游客模式云同步提示 */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-primary/5 border border-primary/10 rounded-3xl flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Cloud size={20} className="text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold">解锁云端同步与多端访问</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  当前数据仅存储在本设备。注册账号后，您的时间数据将获得永久云端备份，并可在任何设备上随时查看。
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              立即注册并同步数据
            </button>
          </motion.div>
        )}

        {/* 时间跨度选择器 */}
        <div className="space-y-4">
          <div className="flex p-1 bg-muted/30 rounded-2xl border border-border/50">
            {[
              { id: "today", label: "今天" },
              { id: "7d", label: "近7日" },
              { id: "30d", label: "近30日" },
              { id: "all", label: "全部" },
              { id: "custom", label: "自定义" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as Period)}
                className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
                  period === p.id
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {period === "custom" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-2xl border border-border/40">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] text-muted-foreground ml-1">
                      开始日期
                    </label>
                    <input
                      type="date"
                      value={customRange.start}
                      onChange={(e) =>
                        setCustomRange((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-sm font-medium focus:outline-none px-1"
                    />
                  </div>
                  <div className="h-8 w-px bg-border/50 self-end mb-1" />
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] text-muted-foreground ml-1">
                      结束日期
                    </label>
                    <input
                      type="date"
                      value={customRange.end}
                      onChange={(e) =>
                        setCustomRange((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-sm font-medium focus:outline-none px-1"
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

        {/* 3. 黄金时间洞察 */}
        <AnalyticsGoldenHours
          goldenHours={analysisData.goldenHours}
          drillDown={drillDown}
          onDrillDown={handleDrillDown}
          onClearFilter={() => setDrillDown(null)}
        />

        {/* 4. 详细记录回顾 */}
        <AnalyticsDrillDownList
          drillDown={drillDown}
          filteredRecords={filteredRecords}
          onJumpToRecord={handleJumpToRecord}
          detailRef={detailRef}
        />

        {/* 5. 洞察与建议 */}
        <section className="p-5 rounded-3xl bg-muted/50 border border-muted-foreground/10 space-y-3">
          <h3 className="font-bold flex items-center gap-2">
            <Coffee size={18} className="text-primary" />
            洞察与建议
          </h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• 每一个数据点都记录着你真实的“迹时”。</p>
            <p>• 点击图表可进一步下钻，回顾高效时段的专注点。</p>
            <p>• 坚持记录，让数据为你揭示时间利用的规律。</p>
          </div>
        </section>
      </div>
    </div>
  );
};
