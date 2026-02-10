/**
 * 单个时段的日程记录卡片
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import { ScheduleItem, Tag, useSchedule } from "../context/ScheduleContext";
import { Plus, Check, X, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { classifier } from "../lib/classifier";
import { AiRecommendationZone } from "./AiRecommendationZone";
import { TagSelector } from "./TagSelector";

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
    // 如果内容没变，直接关闭
    if (localContent === item.content) {
      setIsEditing(false);
      return;
    }
    updateItem(item.hour, localContent, item.tags);
    setIsEditing(false);
    setIsAddingTag(false);
  };

  const handleCancel = () => {
    setLocalContent(item.content); // 恢复原始内容
    setIsEditing(false);
    setIsAddingTag(false);
  };

  const handleApplyToNext = (e: React.MouseEvent, useLocalContent = false) => {
    e.stopPropagation();
    const nextHour = item.hour + 1;
    if (nextHour >= 24) return;

    // 如果在编辑模式下点击，使用当前正在输入的文字
    const contentToCopy = useLocalContent ? localContent : item.content;

    // 使用批量更新确保同步性，或者确保 updateItem 能正确处理
    updateItem(nextHour, contentToCopy, [...item.tags]);
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
          ${isMergedTop ? "rounded-t-none pt-2" : "rounded-t-2xl pt-4"}
          ${isMergedBottom ? "rounded-b-none pb-2" : "rounded-b-2xl pb-4"}
          ${isCurrentHour ? "ring-2 ring-primary/30 shadow-md bg-background animate-pulse-subtle" : ""}
          ${isEditing ? "bg-secondary/80 ring-1 ring-primary/20 z-30" : isCurrentHour ? "" : "bg-secondary/30 hover:bg-secondary/50"}`}
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {/* 内容区域 - 聚合展示时隐藏重复的内容文字，仅保留第一个 */}
        <div className="min-h-[1.5rem] flex flex-col justify-center">
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                ref={inputRef}
                autoFocus
                rows={1}
                className="w-full bg-background border-none rounded-2xl px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-primary/30 outline-none transition-all resize-none overflow-hidden min-h-[44px]"
                value={localContent}
                onChange={(e) => setLocalContent(e.target.value)}
                onBlur={() => {
                  if (localContent !== item.content) {
                    handleSave();
                  } else {
                    setIsEditing(false);
                  }
                }}
                placeholder="记录这段时间..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSave();
                  }
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSave();
                  }
                  if (e.key === "Escape") handleCancel();
                }}
              />

              {/* AI 推荐区 */}
              <AiRecommendationZone
                isAiLoading={isAiLoading}
                aiRecommendedTags={aiRecommendedTags}
                localContent={localContent}
                selectedTags={item.tags}
                onFetchRecommendations={fetchRecommendations}
                onTagToggle={toggleTag}
                onAddCustomTag={addCustomTag}
              />

              {/* 标签与操作区 */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <TagSelector
                  customTags={customTags}
                  selectedTags={item.tags}
                  isAddingTag={isAddingTag}
                  newTagInput={newTagInput}
                  onToggleTag={toggleTag}
                  onSetIsAddingTag={setIsAddingTag}
                  onSetNewTagInput={setNewTagInput}
                  onAddCustomTag={handleAddCustomTag}
                />

                {/* 操作按钮组 - 底部右侧，清晰独立 */}
                <div className="flex items-center gap-2 shrink-0 self-end">
                  {canFillDown && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        // 1. 立即更新当前项
                        updateItem(item.hour, localContent, item.tags);
                        // 2. 立即更新下一项
                        const nextHour = item.hour + 1;
                        updateItem(nextHour, localContent, [...item.tags]);
                        // 3. 退出编辑
                        setIsEditing(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-muted-foreground border border-muted-foreground/10 hover:bg-primary/10 hover:text-primary transition-all active:scale-90 text-sm font-medium"
                      title="保存并延续到下一时段"
                    >
                      <Copy className="w-4 h-4 rotate-90" />
                      延续
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
            <>
              {/* 仅在聚合块的第一个时段展示文字和标签 */}
              {!isMergedTop ? (
                <>
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
                </>
              ) : (
                <div className="h-2" /> // 聚合中的占位
              )}
            </>
          )}
        </div>

        {/* 向下填充按钮 */}
        {!isEditing && canFillDown && (
          <button
            onClick={(e) => handleApplyToNext(e, false)}
            className={`absolute right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/80 backdrop-blur-sm text-muted-foreground p-1 rounded-md border border-muted-foreground/20 shadow-sm hover:text-primary hover:border-primary/30 hover:bg-background active:scale-95 flex items-center gap-1
              ${isMergedBottom ? "-bottom-2" : "bottom-2"}`}
            title="延续到下一段"
          >
            <Copy className="w-3 h-3 rotate-90" />
            <span className="text-[9px] font-medium pr-0.5">延续</span>
          </button>
        )}
      </div>
    </div>
  );
};
