"use client";

import { useTheme } from "next-themes";

// CoinGecko 组件只认布尔属性 dark-mode，不认背景色、字色、涨跌色（读其脚本得出），
// 所以涨跌色只能保持它自带的绿涨红跌
// themeKey 用作元素的 key：自定义元素不监听属性变化，主题变化时要重新挂载
export function useGeckoTheme() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  return {
    themeKey: isDark ? "dark" : "light",
    attrs: isDark ? { "dark-mode": "true" } : {},
  };
}
