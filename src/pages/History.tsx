/**
 * 历史记录页面，用于查看和切换不同日期的日程
 */
import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon, History as HistoryIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const History: React.FC = () => {
  const { getHistoryDates, setCurrentDate, currentDate } = useSchedule();
  const navigate = useNavigate();
  const dates = getHistoryDates();

  const handleDateSelect = (date: string) => {
    setCurrentDate(date);
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background flex flex-col">
      {/* 顶部导航 */}
      <div className="glass-panel sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">往期记录</h1>
        </div>
        
        {/* 日历快捷选择 */}
        <div className="relative">
          <input
            type="date"
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
            onChange={(e) => e.target.value && handleDateSelect(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          <button className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <CalendarIcon size={20} />
          </button>
        </div>
      </div>

      {/* 日期列表 */}
      <div className="flex-1 p-6 space-y-4">
        {dates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-60">
            <HistoryIcon size={48} strokeWidth={1} className="mb-4" />
            <p>暂无历史记录</p>
          </div>
        ) : (
          dates.map((date, index) => {
            const isSelected = date === currentDate;
            const isToday = date === new Date().toISOString().split('T')[0];
            
            return (
              <motion.button
                key={date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleDateSelect(date)}
                className={`w-full text-left p-5 rounded-3xl border transition-all ${
                  isSelected 
                    ? 'bg-primary/5 border-primary ring-1 ring-primary' 
                    : 'bg-white border-border hover:border-primary/40'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={14} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>
                        {date}
                      </span>
                      {isToday && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          今日
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-bold">
                      {new Date(date).toLocaleDateString('zh-CN', { weekday: 'long' })}
                    </div>
                  </div>
                  <div className={`p-2 rounded-full ${isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                    <ArrowRight size={18} />
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
};
