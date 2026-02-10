/**
 * 单个时段的日程记录卡片
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import { ScheduleItem, Tag, useSchedule } from "../context/ScheduleContext";
import {
  Plus,
  Check,
  X,
  Sparkles,
  PlusCircle,
  RotateCw,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { classifier } from "../lib/classifier";

export const ScheduleCard: React.FC<{
  item: ScheduleItem;
  isMergedTop?: boolean;
  isMergedBottom?: boolean;
}> = ({ item, isMergedTop, isMergedBottom }) => {
  const {
    updateItem,
    batchUpdateItems,
    items,
    customTags,
    addCustomTag,
    currentDate,
  } = useSchedule();
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(item.content);

  // 当外部 item.content 更新时，同步 localContent
  useEffect(() => {
    setLocalContent(item.content);
  }, [item.content]);

  const [newTagInput, setNewTagInput] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [aiRecommendedTags, setAiRecommendedTags] = useState<Tag[]>([]);
  const [rejectedTags, setRejectedTags] = useState<Tag[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动调整 textarea 高度
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [localContent, isEditing]);

  // 判断是否为当前时段
  const isToday = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return currentDate === todayStr;
  }, [currentDate]);
  const isCurrentHour = isToday && item.hour === new Date().getHours();

  // 判断是否可以向下填充（当前有内容且下一个时段没内容，或者单纯为了快捷复制）
  const canFillDown = item.content.trim() !== "" && item.hour < 23;

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
  }, [localContent, isEditing]);

  const formatHour = (h: number) => `${h.toString().padStart(2, "0")}:00`;

  const handleSave = () => {
    updateItem(item.hour, localContent, item.tags);
    setIsEditing(false);
    setIsAddingTag(false);
  };

  const handleCancel = () => {
    setLocalContent(item.content); // 恢复原始内容
    setIsEditing(false);
    setIsAddingTag(false);
  };

  const handleApplyToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextHour = item.hour + 1;
    if (nextHour >= 24) return;

    // 找到下一个时段
    const nextItem = items.find((i) => i.hour === nextHour);
    if (!nextItem) return;

    // 批量更新当前及之后连续的空白时段，或者只更新下一个
    // 这里采用更直观的方案：点击一次，向下覆盖一个时段
    updateItem(nextHour, item.content, [...item.tags]);
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
        className={`group transition-all duration-300 p-4 relative
          ${isMergedTop ? "rounded-t-none border-t border-dashed border-muted-foreground/10" : "rounded-t-2xl pt-4"}
          ${isMergedBottom ? "rounded-b-none" : "rounded-b-2xl"}
          ${isCurrentHour ? "ring-2 ring-primary/30 shadow-md bg-background animate-pulse-subtle" : ""}
          ${isEditing ? "bg-secondary/80 ring-1 ring-primary/20 z-30" : isCurrentHour ? "" : "bg-secondary/30 hover:bg-secondary/50"}`}
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {/* 向下填充按钮 - 更加隐蔽，仅在非编辑模式、有内容且鼠标悬停在特定区域时显示 */}
        {!isEditing && canFillDown && (
          <button
            onClick={handleApplyToNext}
            className="absolute -bottom-2.5 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/80 backdrop-blur-sm text-muted-foreground p-1 rounded-md border border-muted-foreground/20 shadow-sm hover:text-primary hover:border-primary/30 hover:bg-background active:scale-95 flex items-center gap-1"
            title="向下填充一个时段"
          >
            <Copy className="w-3 h-3 rotate-90" />
            <span className="text-[9px] font-medium pr-0.5">延续</span>
          </button>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <textarea
              ref={inputRef}
              autoFocus
              rows={1}
              className="w-full bg-background border-none rounded-2xl px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-primary/30 outline-none transition-all resize-none overflow-hidden min-h-[44px]"
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              placeholder="记录这段时间..."
              onKeyDown={(e) => {
                // Enter 键保存，Shift + Enter 换行
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
                // Cmd+Enter 或 Ctrl+Enter 也可以保存
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === "Escape") handleCancel();
              }}
            />

            {/* AI 推荐区 - 仅在有内容时且未加载推荐时显示手动触发按钮，或显示已获取的推荐 */}
            <AnimatePresence mode="popLayout">
              {(isAiLoading ||
                aiRecommendedTags.length > 0 ||
                localContent.trim()) && (
                <motion.div
                  key="ai-section"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-amber-500/5 dark:bg-amber-500/10 rounded-xl p-2.5 border border-amber-500/10"
                >
                  <div className="flex items-center gap-2 min-h-[24px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <div className="flex flex-wrap gap-1.5 items-center flex-1">
                      {isAiLoading ? (
                        <div className="flex items-center gap-2 text-[10px] text-amber-600 dark:text-amber-500">
                          <RotateCw className="w-3 h-3 animate-spin" />
                          AI 思考中...
                        </div>
                      ) : aiRecommendedTags.length > 0 ? (
                        <>
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchRecommendations(true);
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold hover:bg-amber-500/30 transition-colors group"
                            title="重试推荐"
                          >
                            重试
                            <RotateCw className="w-2.5 h-2.5 ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
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
                                className={`px-2.5 py-0.5 rounded-md text-[11px] border transition-colors ${
                                  isSelected
                                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30"
                                    : "bg-background/50 text-amber-600 dark:text-amber-500/80 border-amber-200/50 dark:border-amber-500/20 hover:bg-background"
                                }`}
                              >
                                {isSelected && (
                                  <Check className="inline-block w-2.5 h-2.5 mr-1" />
                                )}
                                {tag}
                              </button>
                            );
                          })}
                        </>
                      ) : (
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchRecommendations();
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold hover:bg-amber-500/20 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          点击获取 AI 标签建议
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 标签与操作区 */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              {/* 自定义标签区 */}
              <div className="flex flex-wrap gap-1.5 items-center flex-1">
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

              {/* 操作按钮组 - 底部右侧，清晰独立 */}
              <div className="flex items-center gap-2 shrink-0 self-end">
                {canFillDown && (
                  <button
                    onClick={handleApplyToNext}
                    className="p-2.5 rounded-xl bg-background text-muted-foreground border border-muted-foreground/10 hover:text-primary hover:border-primary/30 transition-all active:scale-90"
                    title="延续到下一段"
                  >
                    <Copy className="w-4 h-4 rotate-90" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  className="px-4 py-2 rounded-xl bg-background text-muted-foreground border border-muted-foreground/10 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all active:scale-90 text-sm font-medium"
                >
                  取消
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 font-bold text-sm"
                >
                  <Check className="w-4 h-4" />
                  完成
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-[2.5rem] flex flex-col justify-center">
            {item.content ? (
              <p className="text-sm text-foreground/90 font-medium whitespace-pre-wrap">
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
