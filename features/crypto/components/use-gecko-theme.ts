"use client";

import { useSyncExternalStore } from "react";
import { useColorTheme } from "@/hooks/use-color-theme";

const subscribe = () => () => {};
// 服务端与 hydration 期间为 false，之后为 true
const useIsClient = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

// CoinGecko 组件只认布尔属性 dark-mode，不认背景色、字色、涨跌色（读其脚本得出），
// 所以涨跌色只能保持它自带的绿涨红跌
// themeKey 用作元素的 key：自定义元素不监听属性变化，主题变化时要重新挂载
// 服务端不知道主题，写进 HTML 的 dark-mode 属性 React 在 hydration 时不会纠正，
// 所以服务端与 hydration 期间返回 null，调用方此时不渲染组件
export function useGeckoTheme() {
  const colorTheme = useColorTheme();
  const isClient = useIsClient();
  if (!isClient) return null;
  return {
    themeKey: colorTheme,
    themeAttrs: colorTheme === "dark" ? { "dark-mode": "true" } : {},
  };
}
