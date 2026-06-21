"use client";

// TradingView 加密货币市值热力图 Widget 封装
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export default function CryptoHeatmap() {
  const container = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const colorTheme = resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    const widgetContainer = container.current;
    if (!widgetContainer) return;

    widgetContainer.innerHTML = `
      <div class="tradingview-widget-container__widget"></div>
      <div class="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/heatmap/crypto/" rel="noopener nofollow" target="_blank">
          <span class="blue-text">Crypto Heatmap</span>
        </a>
      </div>`;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      dataSource: "Crypto",
      blockSize: "market_cap_calc",
      blockColor: "24h_close_change|5",
      locale: "en",
      symbolUrl: "",
      colorTheme,
      hasTopBar: false,
      isDataSetEnabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: "100%",
      height: "100%",
    });

    widgetContainer.appendChild(script);

    return () => {
      widgetContainer.innerHTML = "";
    };
  }, [colorTheme]);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: "100%", width: "100%" }}
    />
  );
}
