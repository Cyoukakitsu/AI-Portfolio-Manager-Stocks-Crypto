"use client";

import { useEffect, useRef, memo } from "react";

function MarketDataStocks() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widgetContainer = container.current;
    if (!widgetContainer) return;

    // 清空所有内容
    widgetContainer.innerHTML = `
      <div class="tradingview-widget-container__widget"></div>
      <div class="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/markets/?utm_source=www.tradingview.com&utm_medium=widget_new&utm_campaign=market-quotes" rel="noopener nofollow" target="_blank">
          <span class="blue-text">Market summary</span>
        </a>
        <span class="trademark"> by TradingView</span>
      </div>
    `;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      title: "Stocks",
      width: "100%",
      height: "100%",
      locale: "ja", // 日语
      showSymbolLogo: true,
      symbolsGroups: [
        {
          name: "Financial",
          symbols: [
            {
              name: "NYSE:JPM",
              displayName: "JPMorgan Chase",
            },
            {
              name: "NYSE:WFC",
              displayName: "Wells Fargo Co New",
            },
            {
              name: "NYSE:BAC",
              displayName: "Bank Amer Corp",
            },
            {
              name: "NYSE:HSBC",
              displayName: "Hsbc Hldgs Plc",
            },
            {
              name: "NYSE:C",
              displayName: "Citigroup Inc",
            },
            {
              name: "NYSE:MA",
              displayName: "Mastercard Incorporated",
            },
          ],
        },
        {
          name: "Technology",
          symbols: [
            {
              name: "NASDAQ:AAPL",
              displayName: "Apple",
            },
            {
              name: "NASDAQ:GOOGL",
              displayName: "Alphabet",
            },
            {
              name: "NASDAQ:MSFT",
              displayName: "Microsoft",
            },
            {
              name: "NASDAQ:META",
              displayName: "Meta Platforms",
            },
            {
              name: "NYSE:ORCL",
              displayName: "Oracle Corp",
            },
            {
              name: "NASDAQ:INTC",
              displayName: "Intel Corp",
            },
          ],
        },
        {
          name: "Services",
          symbols: [
            {
              name: "NASDAQ:AMZN",
              displayName: "Amazon",
            },
            {
              name: "NYSE:BABA",
              displayName: "Alibaba Group Hldg Ltd",
            },
            {
              name: "NYSE:T",
              displayName: "At&t Inc",
            },
            {
              name: "NYSE:WMT",
              displayName: "Walmart",
            },
            {
              name: "NYSE:V",
              displayName: "Visa",
            },
          ],
        },
      ],
      colorTheme: "light",
    });

    widgetContainer.appendChild(script);

    // 清理函数
    return () => {
      widgetContainer.innerHTML = "";
    };
  }, []);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: "100%", width: "100%" }}
    />
  );
}

export default memo(MarketDataStocks);
