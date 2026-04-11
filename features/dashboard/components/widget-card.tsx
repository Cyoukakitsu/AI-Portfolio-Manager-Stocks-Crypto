import React from "react";
import { Badge } from "@/components/ui/badge";

/* ─────────────────────────────────────────
   Icon accent colours
───────────────────────────────────────── */
export const iconStyles = {
  amber:
    "bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400",
  violet:
    "bg-violet-500/10 text-violet-500 dark:bg-violet-400/10 dark:text-violet-400",
  emerald:
    "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400",
  blue: "bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400",
  orange:
    "bg-orange-500/10 text-orange-500 dark:bg-orange-400/10 dark:text-orange-400",
} as const;

export type IconAccent = keyof typeof iconStyles;

/* ─────────────────────────────────────────
   WidgetCard component
───────────────────────────────────────── */
export function WidgetCard({
  icon: Icon,
  title,
  badge,
  accent = "amber",
  action,
  children,
  className = "",
  contentClassName = "",
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  accent?: IconAccent;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={[
        "group min-w-0 w-full rounded-xl border border-border/60",
        "bg-card shadow-sm transition-shadow duration-200 hover:shadow-md",
        "flex flex-col",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-3 px-3 py-2.5 sm:px-5 sm:py-3.5 border-b border-border/60">
        <span
          className={`flex items-center justify-center h-7 w-7 rounded-lg shrink-0 ${iconStyles[accent]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight flex-1 truncate">
          {title}
        </span>
        {badge && (
          <Badge
            variant="secondary"
            className="text-[10px] px-2 py-0.5 font-medium shrink-0"
          >
            {badge}
          </Badge>
        )}
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={`p-0 w-full flex-1 overflow-hidden ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   StatChip component
───────────────────────────────────────── */
export function StatChip({
  icon: Icon,
  label,
  accent = "amber",
}: {
  icon: React.ElementType;
  label: string;
  accent?: IconAccent;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5">
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full ${iconStyles[accent]}`}
      >
        <Icon className="h-3 w-3" />
      </span>
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
