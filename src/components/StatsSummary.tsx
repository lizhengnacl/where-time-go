/**
 * 顶部统计摘要组件
 */
import React from "react";
import { useSchedule, Tag } from "../context/ScheduleContext";
import { useTheme } from "../context/ThemeContext";
import {
  PieChart,
  Clock,
  Calendar,
  History,
  BarChart2,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const TAG_COLORS: Record<string, string> = {
  工作: "bg-blue-500",
  学习: "bg-purple-500",
  休息: "bg-green-500",
  运动: "bg-orange-500",
  其他: "bg-gray-500",
};

const getTagColor = (tag: string) => {
  return TAG_COLORS[tag] || "bg-slate-400";
};

export const StatsSummary: React.FC = () => {
  const { stats, items, currentDate, setCurrentDate } = useSchedule();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const recordedCount = items.filter((i) => i.content).length;
  const progress = (recordedCount / 24) * 100;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const isToday = currentDate === todayStr;
  const isHistoryPage = location.pathname === "/history";

  const displayDate = new Date(currentDate).toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="glass-panel sticky top-0 z-20 px-4 py-3 shadow-sm border-b">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          {/* Tab Switcher */}
          <div className="flex p-1 bg-muted/50 rounded-xl">
            <button
              onClick={() => {
                setCurrentDate(todayStr);
                if (location.pathname !== "/") navigate("/");
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isToday && !isHistoryPage
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              今天
            </button>
            <button
              onClick={() => navigate("/history")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isHistoryPage || (!isToday && !isHistoryPage)
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              往期
            </button>
          </div>

          <div className="flex flex-col">
            <div className="relative group">
              <span className="text-[10px] text-muted-foreground leading-tight flex items-center gap-0.5 cursor-pointer hover:text-primary transition-colors">
                <Calendar size={10} />
                {displayDate}
                {!isToday && !isHistoryPage && (
                  <span className="ml-1 text-[8px] bg-primary/10 text-primary px-1 rounded-sm">
                    历史
                  </span>
                )}
              </span>
              <input
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                onChange={(e) =>
                  e.target.value && setCurrentDate(e.target.value)
                }
                max={todayStr}
              />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-primary">
                {recordedCount}/24
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            onClick={() => navigate("/analytics")}
            className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
            title="数据统计"
          >
            <BarChart2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {Object.entries(stats).map(([tag, count]) => (
          <div
            key={tag}
            className="flex items-center gap-1.5 bg-muted/30 border border-border/50 px-2 py-1 rounded-md shrink-0 transition-colors hover:bg-muted/50"
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${getTagColor(tag)} shadow-[0_0_4px_rgba(0,0,0,0.1)]`}
            />
            <span className="text-[10px] font-medium whitespace-nowrap">
              {tag}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {count}h
            </span>
          </div>
        ))}
        {Object.keys(stats).length === 0 && (
          <div className="text-[10px] text-muted-foreground/60 py-1 italic">
            专注成就更好的自己 ✨
          </div>
        )}
      </div>
    </div>
  );
};
