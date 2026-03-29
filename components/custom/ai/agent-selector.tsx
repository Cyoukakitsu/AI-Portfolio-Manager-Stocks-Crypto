"use client";
type AgentSelectorProps = {
  selected: string[];
  onChange: (personas: string[]) => void;
  disabled: boolean;
};

const PERSONAS = [
  {
    id: "buffett",
    name: "Warren Buffett",
    title: "Father of Value Investing",
    emoji: "🏛️",
  },
  {
    id: "lynch",
    name: "Peter Lynch",
    title: "Growth Stock Hunter",
    emoji: "📈",
  },
  {
    id: "wood",
    name: "Cathie Wood",
    title: "Queen of Disruptive Innovation",
    emoji: "🚀",
  },
  {
    id: "burry",
    name: "Michael Burry",
    title: "Contrarian Master",
    emoji: "🐻",
  },
  {
    id: "dalio",
    name: "Ray Dalio",
    title: "Macro Cycle Hunter",
    emoji: "🌏",
  },
];

export function AgentSelector({
  selected,
  onChange,
  disabled,
}: AgentSelectorProps) {
  const handleClick = (id: string) => {
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
        {PERSONAS.map((persona) => {
          const isSelected = selected.includes(persona.id);
          const isDisabled = disabled || (selected.length >= 2 && !isSelected);

          return (
            <button
              key={persona.id}
              onClick={() => handleClick(persona.id)}
              disabled={isDisabled}
              className={`
    flex flex-col items-center gap-1 rounded-lg border p-3
    transition-all duration-200
    ${isSelected ? "border-primary bg-primary/5" : "border-border"}
    ${isDisabled && !isSelected ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
  `}
            >
              <span className="text-2xl">{persona.emoji}</span>
              <p className="text-xs font-medium">{persona.name}</p>
              <p className="text-xs text-muted-foreground">{persona.title}</p>
              {isSelected && <span className="text-xs text-primary">Selected</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
