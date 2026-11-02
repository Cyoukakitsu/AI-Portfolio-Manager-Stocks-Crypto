// Dashboard 通用 Widget 卡片容器
import React from "react";
import { Badge } from "@/components/ui/badge";

/* ─────────────────────────────────────────
   Icon accent colours
───────────────────────────────────────── */
// 设计稿只有灰阶：key 保留以兼容各页面传入的 accent，样式一律中性
const NEUTRAL = "bg-muted text-muted-foreground";
export const iconStyles = {
  primary: NEUTRAL,
  amber: NEUTRAL,
  violet: NEUTRAL,
  emerald: NEUTRAL,
  blue: NEUTRAL,
  orange: NEUTRAL,
} as const;

export type IconAccent = keyof typeof iconStyles;

/* ─────────────────────────────────────────
   WidgetCard component
───────────────────────────────────────── */
export function WidgetCard({
  icon: Icon,
  title,
  badge,
  accent = "primary",
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
        "group min-w-0 w-full rounded-xl border border-border",
        "bg-card",
        "flex flex-col",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-3 px-3 py-2.5 sm:px-5 sm:py-3.5 border-b border-border">
        <span
          className={`flex items-center justify-center h-7 w-7 rounded-lg shrink-0 ${iconStyles[accent]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold flex-1 truncate">
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
  accent = "primary",
}: {
  icon: React.ElementType;
  label: string;
  accent?: IconAccent;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5">
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
