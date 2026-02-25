// TradingViewWidget.jsx
"use client";

import { useEffect, useRef, memo } from "react";

function AdvancedChart() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widgetContainer = container.current;
    if (!widgetContainer) return;

    widgetContainer.innerHTML = `
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/symbols/VANTAGE-SP500/"
          rel="noopener nofollow"
          target="_blank"
        >
        <span class="blue-text">AAPL stock chart</span>
        </a>
        <span class="trademark"> by TradingView</span>
      </div>`;

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
          "theme": "light",
          "timezone": "Asia/Tokyo",
          "backgroundColor": "#ffffff",
          "gridColor": "rgba(46, 46, 46, 0.06)",
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
  }, []);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: "100%", width: "100%" }}
    ></div>
  );
}

export default memo(AdvancedChart);
