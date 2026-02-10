/**
 * 单个时段的日程记录卡片
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import { ScheduleItem, Tag, useSchedule } from "../context/ScheduleContext";
import { Plus, Check, X, Sparkles, PlusCircle, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { classifier } from "../lib/classifier";

export const ScheduleCard: React.FC<{ item: ScheduleItem }> = ({ item }) => {
  const { updateItem, customTags, addCustomTag, currentDate } = useSchedule();
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(item.content);
  const [newTagInput, setNewTagInput] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [aiRecommendedTags, setAiRecommendedTags] = useState<Tag[]>([]);
  const [rejectedTags, setRejectedTags] = useState<Tag[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 判断是否为当前时段
  const isToday = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return currentDate === todayStr;
  }, [currentDate]);
  const isCurrentHour = isToday && item.hour === new Date().getHours();

  // AI 推荐标签逻辑
  const fetchRecommendations = async (isRetry = false) => {
    if (!localContent.trim()) return;

    // 如果是重试，将当前显示的推荐标签加入“不满意”列表
    let currentRejected = rejectedTags;
    if (isRetry && aiRecommendedTags.length > 0) {
      currentRejected = [...new Set([...rejectedTags, ...aiRecommendedTags])];
      setRejectedTags(currentRejected);
    }

    setIsAiLoading(true);
    try {
      const tags = await classifier.getRecommendations(
        localContent,
        item.tags,
        currentRejected,
      );
      setAiRecommendedTags(tags);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (!isEditing || !localContent.trim()) {
      setAiRecommendedTags([]);
      setRejectedTags([]); // 退出编辑或内容为空时重置
      return;
    }

    // 调整防抖时间至 500ms，在灵敏度与请求频率之间取得平衡
    const timer = setTimeout(() => fetchRecommendations(false), 500);
    return () => clearTimeout(timer);
  }, [localContent, item.tags, isEditing]);

  const formatHour = (h: number) => `${h.toString().padStart(2, "0")}:00`;

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
      ? item.tags.filter((t) => t !== tag)
      : [...item.tags, tag];
    updateItem(item.hour, item.content, newTags);
  };

  const handleAddCustomTag = () => {
    if (newTagInput.trim()) {
      addCustomTag(newTagInput.trim());
      toggleTag(newTagInput.trim());
      setNewTagInput("");
      setIsAddingTag(false);
    }
  };

  return (
    <div id={`hour-${item.hour}`} className="relative pl-12">
      {/* 时间圆点 */}
      <div
        className={`absolute left-[1.65rem] top-2 w-3 h-3 rounded-full border-2 border-background z-10 
        ${isCurrentHour ? "bg-primary scale-125 shadow-[0_0_8px_hsl(var(--primary)/0.5)]" : item.content ? "bg-primary" : "bg-muted-foreground/30"}`}
      />

      {/* 小时标签 */}
      <div
        className={`absolute left-0 top-0 text-[10px] font-medium w-8 text-right pr-2 ${isCurrentHour ? "text-primary font-bold" : "text-muted-foreground"}`}
      >
        {formatHour(item.hour)}
      </div>

      {/* 内容卡片 */}
      <div
        ref={containerRef}
        className={`group transition-all duration-300 rounded-2xl p-4 
          ${isCurrentHour ? "ring-2 ring-primary/30 shadow-md bg-background animate-pulse-subtle" : ""}
          ${isEditing ? "bg-secondary/80 ring-1 ring-primary/20" : isCurrentHour ? "" : "bg-secondary/30 hover:bg-secondary/50"}`}
        onClick={() => !isEditing && setIsEditing(true)}
        onBlur={isEditing ? handleContainerBlur : undefined}
      >
        {isEditing ? (
          <div className="space-y-3">
            <input
              ref={inputRef}
              autoFocus
              className="w-full bg-background border-none rounded-full px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary/30 outline-none"
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              placeholder="记录这段时间..."
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <div className="flex flex-wrap gap-1.5 pt-1 min-h-[32px] items-center">
              {/* AI 推荐显示区域 - 保持布局稳定 */}
              <AnimatePresence mode="popLayout">
                {isAiLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-3 py-1 text-[10px] text-amber-600 dark:text-amber-500 shrink-0"
                  >
                    <RotateCw className="w-3 h-3 animate-spin" />
                    AI 思考中...
                  </motion.div>
                ) : aiRecommendedTags.length > 0 ? (
                  <motion.div
                    key="recommendations"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 mr-1 shrink-0"
                  >
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchRecommendations(true);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-bold border border-amber-200/50 dark:border-amber-500/20 hover:bg-amber-500/20 transition-colors group"
                      title="重试推荐"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      推荐
                      <RotateCw className="w-2.5 h-2.5 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    {aiRecommendedTags.map((tag) => {
                      const isSelected = item.tags.includes(tag);
                      return (
                        <button
                          key={`ai-${tag}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isSelected) {
                              addCustomTag(tag);
                              toggleTag(tag);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-[11px] border transition-colors ${
                            isSelected
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 cursor-default"
                              : "bg-amber-500/5 text-amber-600 dark:text-amber-500/80 border-amber-200/50 dark:border-amber-500/20 hover:bg-amber-500/10"
                          }`}
                        >
                          {isSelected && (
                            <Check className="inline-block w-2.5 h-2.5 mr-1" />
                          )}
                          {tag}
                        </button>
                      );
                    })}
                    <div className="w-[1px] h-4 bg-muted-foreground/20 mx-1" />
                  </motion.div>
                ) : (
                  localContent.trim() && (
                    <motion.button
                      key="manual-trigger"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchRecommendations();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] text-amber-600/70 dark:text-amber-500/70 hover:text-amber-600 dark:hover:text-amber-500 transition-colors mr-1 shrink-0"
                    >
                      <Sparkles className="w-3 h-3" />
                      点击获取 AI 建议
                    </motion.button>
                  )
                )}
              </AnimatePresence>

              {/* 其他标签也支持布局动画，防止跳变 */}
              <motion.div
                layout
                className="flex flex-wrap gap-1.5 items-center"
              >
                {customTags.map((tag) => (
                  <button
                    key={tag}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTag(tag);
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] transition-all 
                      ${
                        item.tags.includes(tag)
                          ? "bg-primary text-white shadow-sm"
                          : "bg-background text-muted-foreground border border-muted-foreground/10 hover:bg-primary/5"
                      }`}
                  >
                    {tag}
                  </button>
                ))}

                {/* 添加自定义标签按钮 */}
                {isAddingTag ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      className="w-20 bg-background border border-primary/30 rounded-full px-2 py-0.5 text-[11px] outline-none"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddCustomTag();
                        if (e.key === "Escape") setIsAddingTag(false);
                      }}
                      placeholder="标签名"
                    />
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleAddCustomTag}
                      className="p-1 rounded-full bg-primary text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingTag(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] bg-background text-muted-foreground border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:text-primary transition-all"
                  >
                    <PlusCircle className="w-3 h-3" />
                    新增
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="min-h-[2.5rem] flex flex-col justify-center">
            {item.content ? (
              <p className="text-sm text-foreground/90 font-medium">
                {item.content}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground/40 italic">
                空闲时段
              </p>
            )}

            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold"
                  >
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
