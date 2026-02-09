/**
 * 日程记录主页面，包含统计摘要、时间轴和快速导航
 */
import React, { useRef, useEffect } from 'react';
import { Timeline } from '../components/Timeline';
import { StatsSummary } from '../components/StatsSummary';
import { useSchedule } from '../context/ScheduleContext';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const { items, currentDate } = useSchedule();
  const timelineRef = useRef<HTMLDivElement>(null);

  // 自动滚动到当前小时 (仅在查看今日时)
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (currentDate !== todayStr) return;

    const currentHour = new Date().getHours();
    const element = document.getElementById(`hour-${currentHour}`);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [currentDate]);

  return (
    <div className="relative max-w-md mx-auto h-screen flex flex-col overflow-hidden bg-background">
      {/* 顶部统计摘要 */}
      <StatsSummary />

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
