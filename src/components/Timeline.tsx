/**
 * 时间轴布局组件
 */
import React from 'react';
import { ScheduleCard } from './ScheduleCard';
import { ScheduleItem } from '../context/ScheduleContext';
import { motion } from 'framer-motion';

interface TimelineProps {
  items: ScheduleItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className="relative space-y-4">
      {/* 时间轴装饰线 */}
      <div className="timeline-line" />
      
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <ScheduleCard item={item} />
        </motion.div>
      ))}
    </div>
  );
};
