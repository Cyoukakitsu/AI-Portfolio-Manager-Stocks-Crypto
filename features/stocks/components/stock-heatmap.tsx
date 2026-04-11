"use client";

import { useEffect, useRef, memo } from "react";

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widgetContainer = container.current;
    if (!widgetContainer) return;

    widgetContainer.innerHTML = `
    <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/heatmap/stock/"
          rel="noopener nofollow"
          target="_blank"
        >
          <span className="blue-text">Stock Heatmap</span>
        </a>
        <span className="trademark"> by TradingView</span>
      </div>  
    `;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "dataSource": "SPX500",
          "blockSize": "market_cap_basic",
          "blockColor": "change",
          "grouping": "sector",
          "locale": "en",
          "symbolUrl": "",
          "colorTheme": "light",
          "exchanges": [],
          "hasTopBar": false,
          "isDataSetEnabled": false,
          "isZoomEnabled": true,
          "hasSymbolTooltip": true,
          "isMonoSize": false,
          "width": "100%",
          "height": "100%"
        }`;

    widgetContainer.appendChild(script);

    return () => {
      widgetContainer.innerHTML = "";
    };
  }, []);

  return <div className="tradingview-widget-container" ref={container}></div>;
}

export default memo(TradingViewWidget);
