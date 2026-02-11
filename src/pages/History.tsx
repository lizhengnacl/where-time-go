/**
 * 历史记录页面，用于查看和切换不同日期的日程
 */
import React, { useMemo } from "react";
import { useSchedule } from "../context/ScheduleContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  History as HistoryIcon,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

export const History: React.FC = () => {
  const { getHistoryDates, setCurrentDate, currentDate } = useSchedule();
  const navigate = useNavigate();
  const location = useLocation();
  const dates = getHistoryDates();
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const handleDateSelect = (date: string) => {
    setCurrentDate(date);
    navigate("/");
  };

  // 按月份分组
  const groupedDates = useMemo(() => {
    const groups: Record<string, string[]> = {};
    dates.forEach((date) => {
      const month = new Date(date).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
      });
      if (!groups[month]) groups[month] = [];
      groups[month].push(date);
    });
    return Object.entries(groups);
  }, [dates]);

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-background flex flex-col shadow-2xl border-x border-border/50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* 顶部导航 */}
      <div className="glass-panel sticky top-0 z-20 px-6 py-4 flex items-center justify-between border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-all active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-black bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            往期回顾
          </h1>
        </div>

        {/* 日历快捷选择 */}
        <div className="relative">
          <input
            type="date"
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
            onChange={(e) => e.target.value && handleDateSelect(e.target.value)}
            max={todayStr}
          />
          <button className="p-2.5 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95 border border-primary/20 shadow-sm">
            <CalendarIcon size={20} />
          </button>
        </div>
      </div>

      {/* 日期列表 */}
      <div className="flex-1 overflow-y-auto">
        {dates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground/60 p-6">
            <div className="w-20 h-20 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mb-6">
              <HistoryIcon size={40} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium">还没有留下时光的足迹</p>
          </div>
        ) : (
          <div className="p-6 pt-2 space-y-10">
            {groupedDates.map(([month, monthDates], groupIndex) => (
              <div key={month} className="space-y-4">
                <div className="sticky top-0 z-10 py-3 bg-background/80 backdrop-blur-md -mx-6 px-6 flex items-center gap-3 border-b border-border/5">
                  <h2 className="text-xs font-black text-primary/80 uppercase tracking-[0.2em]">
                    {month}
                  </h2>
                  <div className="h-px bg-primary/10 flex-1" />
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {monthDates.map((date, index) => {
                    const isSelected = date === currentDate;
                    const isToday = date === todayStr;
                    const dateObj = new Date(date);
                    const day = dateObj.getDate();
                    const weekday = dateObj.toLocaleDateString("zh-CN", {
                      weekday: "short",
                    });

                    return (
                      <motion.button
                        key={date}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                        onClick={() => handleDateSelect(date)}
                        className={`group relative w-full text-left p-4 rounded-[2rem] border transition-all active:scale-[0.98] ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-lg shadow-primary/5 ring-1 ring-primary/20"
                            : "bg-background/40 border-border/40 hover:border-primary/40 hover:bg-background/60 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                            }`}
                          >
                            <span className="text-lg font-black leading-none">
                              {day}
                            </span>
                            <span className="text-[10px] font-bold uppercase mt-0.5">
                              {weekday}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-bold truncate ${isSelected ? "text-primary" : "text-foreground/80"}`}
                              >
                                {date}
                              </span>
                              {isToday && (
                                <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-black shadow-sm shadow-primary/20">
                                  TODAY
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                              点击回顾这一天的时光
                            </p>
                          </div>

                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-primary text-white scale-110"
                                : "bg-muted/50 text-muted-foreground group-hover:translate-x-1"
                            }`}
                          >
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部装饰 */}
      <div className="p-6 text-center">
        <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">
          Time is the canvas of your life
        </p>
      </div>
    </div>
  );
};
