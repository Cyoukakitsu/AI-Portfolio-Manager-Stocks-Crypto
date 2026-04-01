"use client";

import { AgentPersona } from "@/types/ai";
import { PERSONA_META } from "@/lib/ai/constants";

type AgentSelectorProps = {
  selected: AgentPersona[];
  onChange: (personas: AgentPersona[]) => void;
  disabled: boolean;
};

// AgentPersona 的所有值，顺序固定
const PERSONA_IDS: AgentPersona[] = ["buffett", "lynch", "wood", "burry", "dalio"];

export function AgentSelector({
  selected,
  onChange,
  disabled,
}: AgentSelectorProps) {
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
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Select Analysts</p>
        <p className="text-xs text-muted-foreground">
          {selected.length} / 2 selected
        </p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {PERSONA_IDS.map((id) => {
          const meta = PERSONA_META[id];
          const isSelected = selected.includes(id);
          const isDisabled = disabled || (selected.length >= 2 && !isSelected);

          return (
            <button
              key={id}
              onClick={() => handleClick(id)}
              disabled={isDisabled}
              className={`
    flex flex-col items-center gap-1 rounded-lg border p-3
    transition-all duration-200
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
