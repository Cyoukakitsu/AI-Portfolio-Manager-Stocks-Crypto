import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind 类名合并工具函数
 *
 * clsx 负责处理条件类名（如 cx("a", isActive && "b")），
 * twMerge 负责解决 Tailwind 类名冲突（如 "p-2 p-4" → 保留 "p-4"）。
 * 两者组合使用是 shadcn/ui 生态的标准写法。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
