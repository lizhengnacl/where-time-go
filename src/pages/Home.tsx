/**
 * 日程记录主页面，包含统计摘要、时间轴和快速导航
 */
import React, { useRef, useEffect } from "react";
import { Timeline } from "../components/Timeline";
import { StatsSummary } from "../components/StatsSummary";
import { useSchedule } from "../context/ScheduleContext";
import { motion } from "framer-motion";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Home: React.FC = () => {
  const { items, currentDate } = useSchedule();
  const timelineRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isGuest = !localStorage.getItem("user");

  // 自动滚动到当前小时 (仅在查看今日时)
  useEffect(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (currentDate !== todayStr) return;

    const currentHour = new Date().getHours();
    const element = document.getElementById(`hour-${currentHour}`);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  }, [currentDate]);

  return (
    <div className="relative max-w-2xl mx-auto h-screen flex flex-col overflow-hidden bg-background shadow-2xl border-x border-border/50">
      {/* 顶部统计摘要 */}
      <StatsSummary />

      {/* 游客模式提示 */}
      {isGuest && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/login")}
          className="mx-4 mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-500">
                当前为游客模式
              </p>
              <p className="text-[10px] text-amber-600/80 dark:text-amber-500/70">
                数据仅存在本地，注册即可同步云端
              </p>
            </div>
          </div>
          <ChevronRight
            size={16}
            className="text-amber-500 group-hover:translate-x-0.5 transition-transform"
          />
        </motion.div>
      )}

      {/* 主体时间轴内容 */}
      <div
        ref={timelineRef}
        className="flex-1 overflow-y-auto scroll-smooth pb-20 px-4"
      >
        <Timeline items={items} />
      </div>

      {/* 底部装饰层 */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};
