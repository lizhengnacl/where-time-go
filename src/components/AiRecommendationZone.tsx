import React from "react";
import { Sparkles, RotateCw, Check, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag } from "../context/ScheduleContext";
import { useNavigate } from "react-router-dom";

interface AiRecommendationZoneProps {
  isAiLoading: boolean;
  aiRecommendedTags: Tag[];
  localContent: string;
  selectedTags: Tag[];
  onFetchRecommendations: (isRetry?: boolean) => void;
  onTagToggle: (tag: Tag) => void;
  onAddCustomTag: (tag: Tag) => void;
}

export const AiRecommendationZone: React.FC<AiRecommendationZoneProps> = ({
  isAiLoading,
  aiRecommendedTags,
  localContent,
  selectedTags,
  onFetchRecommendations,
  onTagToggle,
  onAddCustomTag,
}) => {
  const navigate = useNavigate();
  const isGuest = !localStorage.getItem("user");

  if (!isAiLoading && aiRecommendedTags.length === 0 && !localContent.trim()) {
    return null;
  }

  return (
    <AnimatePresence mode="popLayout">
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
            ) : isGuest ? (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/login");
                }}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold hover:bg-amber-500/20 transition-colors"
              >
                <LogIn className="w-3 h-3" />
                登录/注册以解锁 AI 语义标签建议
              </button>
            ) : aiRecommendedTags.length > 0 ? (
              <>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFetchRecommendations(true);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold hover:bg-amber-500/30 transition-colors group"
                  title="重试推荐"
                >
                  重试
                  <RotateCw className="w-2.5 h-2.5 ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
                {aiRecommendedTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={`ai-${tag}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSelected) {
                          onAddCustomTag(tag);
                          onTagToggle(tag);
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
                  onFetchRecommendations();
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
    </AnimatePresence>
  );
};
