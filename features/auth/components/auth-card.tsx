"use client";

// Auth 表单的公共视觉片段：卡片外壳、标题区、字段下方的错误/提示文字、链接样式
// 样式依据 DESIGN.md：无阴影、无渐变，卡片 12px 圆角 + 24px 内边距 + 1px 线色边框
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

// 系统开启"减少动态效果"时返回 0，淡入淡出与高度变化都瞬间完成。
// MotionConfig 的 reducedMotion="user" 只关位移与布局动画，透明度、高度动画仍会播放，所以不能只靠它（DESIGN.md：开启时全部关闭）
export function useFadeDuration(seconds: number) {
  return useReducedMotion() ? 0 : seconds;
}

const focusRing =
  "rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** 正文里的主链接（如"新規登録""サインイン"） */
export const authLinkClass = cn(
  "font-medium text-strong underline-offset-4 hover:underline",
  focusRing,
);

/** 次要的小链接（如"パスワードをお忘れの方"） */
export const authSubtleLinkClass = cn(
  "cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground",
  focusRing,
);

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-6">
      {children}
    </div>
  );
}

export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold tracking-[-0.6px] text-strong">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

/**
 * 字段下方的消息：有错误时显示错误（琥珀色），否则显示提示（灰色），都没有则不占位。
 * id 供输入框的 aria-describedby 引用。
 */
export function FieldMessage({
  id,
  error,
  hint,
}: {
  id: string;
  error?: string;
  hint?: string;
}) {
  const duration = useFadeDuration(0.15);
  return (
    <AnimatePresence mode="wait" initial={false}>
      {error ? (
        <motion.p
          key="error"
          id={id}
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration }}
          className="overflow-hidden text-xs text-destructive"
        >
          {error}
        </motion.p>
      ) : hint ? (
        <motion.p
          key="hint"
          id={id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
          className="text-xs text-muted-foreground"
        >
          {hint}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
