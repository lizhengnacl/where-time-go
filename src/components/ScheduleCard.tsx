/**
 * 单个时段的日程记录卡片
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ScheduleItem, Tag, useSchedule } from '../context/ScheduleContext';
import { Plus, Check, X, Sparkles, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 模拟 AI 推荐逻辑的关键词映射
const AI_KEYWORDS: Record<string, Tag[]> = {
  '写代码|开发|程序|bug|编程|git|代码': ['工作', '学习'],
  '开会|会议|沟通|同步|汇报|日报': ['工作'],
  '读书|看书|网课|学习|笔记|背单词': ['学习'],
  '健身|跑步|运动|游泳|瑜伽|打球': ['运动'],
  '睡觉|休息|午睡|发呆|冥想': ['休息'],
  '吃饭|早餐|午餐|晚餐|零食|下午茶': ['其他', '休息'],
  '游戏|电影|刷剧|短视频|玩': ['其他', '休息']
};

export const ScheduleCard: React.FC<{ item: ScheduleItem }> = ({ item }) => {
  const { updateItem, customTags, addCustomTag } = useSchedule();
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(item.content);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // AI 推荐标签逻辑
  const aiRecommendedTags = useMemo(() => {
    if (!localContent) return [];
    const recommended = new Set<Tag>();
    Object.entries(AI_KEYWORDS).forEach(([pattern, tags]) => {
      if (new RegExp(pattern, 'i').test(localContent)) {
        tags.forEach(t => recommended.add(t));
      }
    });
    // 过滤掉已经存在的标签
    return Array.from(recommended).filter(t => !item.tags.includes(t));
  }, [localContent, item.tags]);

  const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;

  const handleSave = () => {
    updateItem(item.hour, localContent, item.tags);
    setIsEditing(false);
    setIsAddingTag(false);
  };

  const handleContainerBlur = (e: React.FocusEvent) => {
    const currentTarget = e.currentTarget;
    // 使用 requestAnimationFrame 或 setTimeout 确保 document.activeElement 已更新
    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        handleSave();
      }
    }, 150);
  };

  const toggleTag = (tag: Tag) => {
    const newTags = item.tags.includes(tag)
      ? item.tags.filter(t => t !== tag)
      : [...item.tags, tag];
    updateItem(item.hour, item.content, newTags);
  };

  const handleAddCustomTag = () => {
    if (newTagInput.trim()) {
      addCustomTag(newTagInput.trim());
      toggleTag(newTagInput.trim());
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  return (
    <div id={`hour-${item.hour}`} className="relative pl-12">
      {/* 时间圆点 */}
      <div className={`absolute left-[1.65rem] top-2 w-3 h-3 rounded-full border-2 border-background z-10 
        ${item.content ? 'bg-primary' : 'bg-muted-foreground/30'}`} 
      />
      
      {/* 小时标签 */}
      <div className="absolute left-0 top-0 text-[10px] font-medium text-muted-foreground w-8 text-right pr-2">
        {formatHour(item.hour)}
      </div>

      {/* 内容卡片 */}
      <div 
        ref={containerRef}
        className={`group transition-all duration-300 rounded-2xl p-4 
          ${isEditing ? 'bg-secondary/80 ring-1 ring-primary/20' : 'bg-secondary/30 hover:bg-secondary/50'}`}
        onClick={() => !isEditing && setIsEditing(true)}
        onBlur={isEditing ? handleContainerBlur : undefined}
      >
        {isEditing ? (
          <div className="space-y-3">
            <input
              ref={inputRef}
              autoFocus
              className="w-full bg-white border-none rounded-full px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary/30 outline-none"
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              placeholder="记录这段时间..."
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {/* AI 推荐显示 */}
              <AnimatePresence>
                {aiRecommendedTags.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-1.5 mr-2"
                  >
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200">
                      <Sparkles className="w-2.5 h-2.5" />
                      推荐
                    </div>
                    {aiRecommendedTags.map(tag => (
                      <button
                        key={`ai-${tag}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTag(tag);
                        }}
                        className="px-3 py-1 rounded-full text-[11px] bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                    <div className="w-[1px] h-4 bg-muted-foreground/20 mx-1" />
                  </motion.div>
                )}
              </AnimatePresence>

              {customTags.map(tag => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTag(tag);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] transition-all 
                    ${item.tags.includes(tag) 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-white text-muted-foreground border border-muted-foreground/10 hover:bg-primary/5'}`}
                >
                  {tag}
                </button>
              ))}

              {/* 添加自定义标签按钮 */}
              {isAddingTag ? (
                <div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
                  <input
                    autoFocus
                    className="w-20 bg-white border border-primary/30 rounded-full px-2 py-0.5 text-[11px] outline-none"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCustomTag();
                      if (e.key === 'Escape') setIsAddingTag(false);
                    }}
                    placeholder="标签名"
                  />
                  <button onClick={handleAddCustomTag} className="p-1 rounded-full bg-primary text-white">
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddingTag(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] bg-white text-muted-foreground border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:text-primary transition-all"
                >
                  <PlusCircle className="w-3 h-3" />
                  新增
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="min-h-[2.5rem] flex flex-col justify-center">
            {item.content ? (
              <p className="text-sm text-foreground/90 font-medium">{item.content}</p>
            ) : (
              <p className="text-sm text-muted-foreground/40 italic">空闲时段</p>
            )}
            
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
