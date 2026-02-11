/**
 * 顶部统计摘要组件
 */
import React from "react";
import { useSchedule } from "../context/ScheduleContext";
import { useTheme } from "../context/ThemeContext";
import {
  Calendar,
  BarChart2,
  Sun,
  Moon,
  LogOut,
  User,
  Cloud,
  CloudOff,
  MessageSquarePlus,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { FeedbackModal } from "./FeedbackModal";

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
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const recordedCount = items.filter((i) => i.content).length;
  const progress = (recordedCount / 24) * 100;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const isToday = currentDate === todayStr;
  const isHistoryPage = location.pathname === "/history";
  const isLoggedIn = !!localStorage.getItem("user");

  const displayDate = new Date(currentDate).toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="glass-panel sticky top-0 z-20 shadow-sm border-b bg-background/80 backdrop-blur-md">
      {/* 第一行：Logo 与 全局操作 */}
      <div className="flex items-center justify-between px-4 py-3">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img
            src="/time/logo.svg"
            alt="Timary Logo"
            className="w-7 h-7 rounded-lg shadow-sm"
          />
          <span className="text-base font-black bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent">
            迹时
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          <button
            onClick={() => navigate("/analytics")}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
            title="数据统计"
          >
            <BarChart2 size={19} />
          </button>

          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
            title="反馈建议"
          >
            <MessageSquarePlus size={19} />
          </button>

          {localStorage.getItem("user") ? (
            <button
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/time/login";
              }}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-danger"
              title="退出登录"
            >
              <LogOut size={19} />
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
              title="登录"
            >
              <User size={19} />
            </button>
          )}
        </div>
      </div>

      {/* 第二行：核心数据卡片 */}
      <div className="px-4 pb-3">
        <div className="bg-muted/40 rounded-2xl p-4 border border-border/40 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <div className="relative group flex items-center gap-1.5">
                <span className="text-sm font-bold flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
                  <Calendar size={14} className="text-primary" />
                  {displayDate}
                  {!isToday && !isHistoryPage && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">
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
              <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                {isLoggedIn ? (
                  <>
                    <Cloud size={10} className="text-green-500" />
                    云端同步已开启
                  </>
                ) : (
                  <>
                    <CloudOff size={10} className="text-amber-500" />
                    本地模式，建议登录
                  </>
                )}
              </p>
            </div>

            {/* 今天/往期 切换器 */}
            <div className="flex p-1 bg-background/60 rounded-xl border border-border/20 shadow-sm">
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
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-foreground">
                今日进度
              </span>
              <span className="text-xs font-mono font-bold text-primary">
                {recordedCount}{" "}
                <span className="text-muted-foreground font-normal">/ 24</span>
              </span>
            </div>
            <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden border border-border/10 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 第三行：标签统计滚动条 */}
      {Object.keys(stats).length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
          {Object.entries(stats).map(([tag, count]) => (
            <div
              key={tag}
              className="flex items-center gap-2 bg-background/40 border border-border/40 px-3 py-1.5 rounded-xl shrink-0 transition-all hover:border-primary/30 hover:bg-background/60 group"
            >
              <div
                className={`w-2 h-2 rounded-full ${getTagColor(tag)} shadow-sm group-hover:scale-110 transition-transform`}
              />
              <span className="text-[11px] font-bold whitespace-nowrap">
                {tag}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono bg-muted/50 px-1.5 rounded-md">
                {count}h
              </span>
            </div>
          ))}
        </div>
      )}
      <FeedbackModal isOpen={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} />
    </div>
  );
};
