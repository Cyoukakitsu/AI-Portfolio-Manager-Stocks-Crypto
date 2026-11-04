"use client";

import { useTheme } from "next-themes";

// CoinGecko 组件只认属性里的色值，取值与 app/globals.css 的令牌一致（红涨绿跌）
const COLORS = {
  dark: { bg: "#0b0e11", font: "#eaecef", up: "#f6465d", down: "#0ecb81" },
  light: { bg: "#ffffff", font: "#181a20", up: "#e5384f", down: "#0a9f66" },
};

// themeKey 用作元素的 key，主题变化时让自定义元素重新挂载（它不监听属性变化）
export function useGeckoTheme() {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "light" : "dark";
  const c = COLORS[theme];
  return {
    themeKey: theme,
    attrs: {
      "background-color": c.bg,
      "font-color": c.font,
      "positive-color": c.up,
      "negative-color": c.down,
    },
  };
}
