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
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell as RechartsCell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

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
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            key={`records-${period}-${customRange.start}-${customRange.end}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center text-center"
          >
            <span className="text-xs text-muted-foreground mb-1">
              {period === "all"
                ? "累计"
                : period === "custom"
                  ? "选定时段"
                  : `近${analysisData.periodDays}日`}
              记录
            </span>
            <div className="text-2xl font-bold text-primary">
              {analysisData.totalRecords}
              <span className="text-xs ml-1 font-normal opacity-70">条</span>
            </div>
          </motion.div>
          <motion.div
            key={`days-${period}-${customRange.start}-${customRange.end}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-3xl bg-secondary/5 border border-secondary/10 flex flex-col items-center justify-center text-center"
          >
            <span className="text-xs text-muted-foreground mb-1">分析天数</span>
            <div className="text-2xl font-bold text-secondary">
              {analysisData.periodDays}
              <span className="text-xs ml-1 font-normal opacity-70">天</span>
            </div>
          </motion.div>
        </div>

        {/* 1. 分类占比 */}
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
                onClick={() => setDrillDown(null)}
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
                  data={analysisData.pieData}
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
                      handleDrillDown({ type: "tag", value: data.name as Tag });
                    }
                  }}
                  className="cursor-pointer"
                >
                  {analysisData.pieData.map((entry, index) => (
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

        {/* 2. 活跃趋势 */}
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
                onClick={() => setDrillDown(null)}
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
                <BarChart data={analysisData.dailyTrend}>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    style={{ fontSize: "10px" }}
                    interval={
                      period === "all" || period === "custom"
                        ? Math.max(
                            0,
                            Math.floor(analysisData.dailyTrend.length / 8),
                          )
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
                        handleDrillDown({ type: "date", value: data.fullDate });
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {analysisData.dailyTrend.map((entry, index) => (
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

        {/* 3. 黄金时间洞察 */}
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
                onClick={() => setDrillDown(null)}
                className="text-xs text-primary flex items-center gap-1"
              >
                清除筛选 <XCircle size={12} />
              </button>
            )}
          </div>
          <div className="grid gap-3">
            {analysisData.goldenHours.map((gh, idx) => (
              <motion.button
                key={gh.hour}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  handleDrillDown({ type: "hour", value: gh.hour })
                }
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left w-full ${
                  drillDown?.type === "hour" && drillDown.value === gh.hour
                    ? "bg-orange-50 border-orange-200 ring-2 ring-orange-200/50"
                    : "bg-background border-border hover:border-orange-100 dark:hover:border-orange-900"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-bold">
                    {gh.hour}:00 - {gh.hour + 1}:00
                  </div>
                  <div className="text-xs text-muted-foreground">
                    该时段专注 {gh.count} 次
                  </div>
                </div>
                <Target className="text-orange-200" size={24} />
              </motion.button>
            ))}
            {analysisData.goldenHours.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm italic">
                记录更多“工作”或“学习”内容来解锁分析
              </div>
            )}
          </div>
        </section>

        {/* 下钻详情区域 */}
        <div ref={detailRef} className="scroll-mt-24">
          <AnimatePresence mode="wait">
            {drillDown && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    详情列表
                    <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {filteredRecords.length}
                    </span>
                  </h2>
                  <button
                    onClick={() => setDrillDown(null)}
                    className="p-1 hover:bg-muted rounded-full transition-colors"
                  >
                    <XCircle size={20} className="text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-3">
                  {filteredRecords.map(({ date, item }, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={`${date}-${item.hour}`}
                      onClick={() => handleJumpToRecord(date)}
                      className="bg-background p-4 rounded-2xl border border-border shadow-sm flex flex-col gap-2 active:scale-[0.98] transition-transform cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {item.hour}:00
                          </span>
                        </div>
                        <div className="flex gap-1 flex-wrap justify-end max-w-[50%]">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded-md text-white whitespace-nowrap"
                              style={{ backgroundColor: getTagColor(tag) }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm font-medium leading-relaxed group-hover:text-primary transition-colors">
                        {item.content}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* 时间管理建议 */}
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
