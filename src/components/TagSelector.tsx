import React from "react";
import { Check, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Tag } from "../context/ScheduleContext";

interface TagSelectorProps {
  customTags: Tag[];
  selectedTags: Tag[];
  isAddingTag: boolean;
  newTagInput: string;
  onToggleTag: (tag: Tag) => void;
  onSetIsAddingTag: (value: boolean) => void;
  onSetNewTagInput: (value: string) => void;
  onAddCustomTag: () => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  customTags,
  selectedTags,
  isAddingTag,
  newTagInput,
  onToggleTag,
  onSetIsAddingTag,
  onSetNewTagInput,
  onAddCustomTag,
}) => {
  return (
    <div className="flex flex-wrap gap-1.5 items-center flex-1">
      <motion.div layout className="flex flex-wrap gap-1.5 items-center">
        {customTags.map((tag) => (
          <button
            key={tag}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleTag(tag);
            }}
            className={`px-3 py-1 rounded-full text-[11px] transition-all 
            ${
              selectedTags.includes(tag)
                ? "bg-primary text-white shadow-sm"
                : "bg-background text-muted-foreground border border-muted-foreground/10 hover:bg-primary/5"
            }`}
          >
            {tag}
          </button>
        ))}
        {isAddingTag ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              className="w-20 bg-background border border-primary/30 rounded-full px-2 py-0.5 text-[11px] outline-none"
              value={newTagInput}
              onFocus={(e) =>
                e.currentTarget.setSelectionRange(
                  e.currentTarget.value.length,
                  e.currentTarget.value.length,
                )
              }
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onChange={(e) => onSetNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  onAddCustomTag();
                }
                if (e.key === "Escape") {
                  e.stopPropagation();
                  onSetIsAddingTag(false);
                }
              }}
              placeholder="标签名"
            />
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                onAddCustomTag();
              }}
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
              onSetIsAddingTag(true);
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] bg-background text-muted-foreground border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:text-primary transition-all"
          >
            <PlusCircle className="w-3 h-3" />
            新增
          </button>
        )}
      </motion.div>
    </div>
  );
};
