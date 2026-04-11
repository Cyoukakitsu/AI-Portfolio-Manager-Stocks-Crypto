"use client";

// 自定义 Hook：将 TradingView 第三方脚本嵌入到指定 DOM 容器中
//
// TradingView 的 Widget 通过向 DOM 注入 <script> 标签来初始化，
// 并不是标准的 React 组件，所以需要通过 useRef + useEffect 手动操作 DOM。
// 这种模式也称为"逃生舱"（Escape Hatch）—— 绕开 React 的声明式渲染直接操作真实 DOM。

import { useEffect, useRef } from "react";

const useTradingView = (
  scriptUrl: string,
  config: Record<string, unknown>, // TradingView Widget 的配置项（通过 script.innerHTML 传入）
  height = 600,
) => {
  // useRef 存储 DOM 容器引用，不会触发重渲染，是操作 DOM 的标准方式
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // dataset.loaded 作为防重复初始化的标志：
    // React 严格模式（StrictMode）会在开发环境中执行两次 Effect，
    // 若不加此检查，TradingView 脚本会被注入两次，导致 Widget 重叠或报错
    if (container.dataset.loaded) return;
    container.innerHTML = `<div class="tradingview-widget-container__widget" style="height: ${height}px; width: 100%;"></div>`;

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    // TradingView 通过读取 script 标签内的 JSON 来获取配置，
    // 这是其 Widget API 的特殊约定，不是标准做法
    script.innerHTML = JSON.stringify(config);

    container.appendChild(script);
    // 打标记，防止后续副作用重复执行时再次注入脚本
    container.dataset.loaded = "true";

    return () => {
      container.innerHTML = "";
      delete container.dataset.loaded;
    };
  }, [scriptUrl, config, height]);

  // 将 ref 返回给调用方，让调用方通过 ref={containerRef} 绑定到目标 DOM 元素
  return containerRef;
};

export default useTradingView;
