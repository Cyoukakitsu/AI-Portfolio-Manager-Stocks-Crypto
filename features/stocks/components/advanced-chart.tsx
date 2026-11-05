// TradingViewWidget.jsx
"use client";

import { useEffect, useRef } from "react";
import { useColorTheme } from "@/hooks/use-color-theme";

function AdvancedChart() {
  const container = useRef<HTMLDivElement>(null);
  const colorTheme = useColorTheme();
  // 与 globals.css 的 --background、--grid 同值；TradingView 要字面颜色，读不了 CSS 变量
  const backgroundColor = colorTheme === "dark" ? "#0b0e11" : "#ffffff";
  const gridColor =
    colorTheme === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)";

  useEffect(() => {
    const widgetContainer = container.current;
    if (!widgetContainer) return;

    widgetContainer.innerHTML = `<div class="tradingview-widget-container__widget"></div>`;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "allow_symbol_change": true,
          "calendar": false,
          "details": false,
          "hide_side_toolbar": true,
          "hide_top_toolbar": false,
          "hide_legend": false,
          "hide_volume": false,
          "hotlist": false,
          "interval": "D",
          "locale": "ja",
          "save_image": true,
          "style": "1",
          "symbol": "NASDAQ:AAPL",
          "theme": "${colorTheme}",
          "timezone": "Asia/Tokyo",
          "backgroundColor": "${backgroundColor}",
          "gridColor": "${gridColor}",
          "watchlist": [],
          "withdateranges": false,
          "compareSymbols": [],
          "studies": [],
          "autosize": true
        }`;

    widgetContainer.appendChild(script);

    return () => {
      widgetContainer.innerHTML = "";
    };
  }, [colorTheme, backgroundColor, gridColor]);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: "100%", width: "100%" }}
    ></div>
  );
}

export default AdvancedChart;
