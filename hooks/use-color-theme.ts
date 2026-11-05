"use client";

import { useTheme } from "next-themes";

// 嵌入件与图表用的主题：挂载前 resolvedTheme 是 undefined，统一按深色处理（设计为深色优先）
export function useColorTheme(): "dark" | "light" {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "light" ? "light" : "dark";
}
