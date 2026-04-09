"use client";

// 投资分析师选择器组件，最多可同时选择 2 个分析师
import { AgentPersona } from "@/types/ai";
import { PERSONA_META } from "@/lib/ai/constants";

type AgentSelectorProps = {
  selected: AgentPersona[]; // 当前已选中的分析师列表
  onChange: (personas: AgentPersona[]) => void; // 选择变更时的回调
  disabled: boolean; // 是否禁用（AI 分析进行中时禁用）
};

// 所有可选分析师的 ID，顺序固定
const PERSONA_IDS: AgentPersona[] = [
  "buffett",
  "lynch",
  "wood",
  "burry",
  "dalio",
];

export function AgentSelector({
  selected,
  onChange,
  disabled,
}: AgentSelectorProps) {
  // 点击分析师卡片：已选则取消，未选且未满 2 个则添加
  const handleClick = (id: AgentPersona) => {
    if (disabled) return;

    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else if (selected.length < 2) {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-3">
      {/* 标题栏：显示当前选中数量 */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Select Analysts</p>
        <p className="text-xs text-muted-foreground">
          {selected.length} / 2 selected
        </p>
      </div>

      {/* 分析师卡片网格 */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {PERSONA_IDS.map((id) => {
          const meta = PERSONA_META[id];

          // 已选中的卡片
          const isSelected = selected.includes(id);
          // 已选满 2 个时，未选中的卡片禁用
          const isDisabled = disabled || (selected.length === 2 && !isSelected);

          return (
            <button
              key={id}
              onClick={() => handleClick(id)}
              disabled={isDisabled}
              className={`
              flex flex-col items-center gap-1 rounded-lg border p-3 transition-all duration-200
              ${isSelected ? "border-primary bg-primary/5" : "border-border"}
              ${isDisabled && !isSelected ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <span className="text-2xl">{meta.emoji}</span>
              <p className="text-xs font-medium">{meta.name}</p>
              <p className="text-xs text-muted-foreground">{meta.role}</p>
              {isSelected && (
                <span className="text-xs text-primary">Selected</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
