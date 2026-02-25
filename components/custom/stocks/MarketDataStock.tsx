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
          name: "Electronic Technology",
          symbols: [
            {
              name: "NASDAQ:NVDA",
              displayName: "NVIDIA",
            },
            {
              name: "NASDAQ:AAPL",
              displayName: "Apple",
            },
            {
              name: "NASDAQ:AVGO",
              displayName: "Broadcom",
            },
            {
              name: "NASDAQ:AMD",
              displayName: "AMD",
            },
            {
              name: "NYSE:TSM",
              displayName: "Taiwan Semiconductor",
            },
          ],
        },
        {
          name: "Finance",
          symbols: [
            {
              name: "NYSE:BRK.B",
              displayName: "Berkshire Hathaway",
            },
            {
              name: "NYSE:JPM",
              displayName: "JPMorgan Chase",
            },
            {
              name: "NYSE:V",
              displayName: "Visa",
            },
            {
              name: "NYSE:MA",
              displayName: "Mastercard",
            },
            {
              name: "NYSE:BAC",
              displayName: "Bank of America",
            },
          ],
        },
        {
          name: "Technology Services",
          symbols: [
            {
              name: "NASDAQ:MSFT",
              displayName: "Microsoft",
            },
            {
              name: "NASDAQ:GOOGL",
              displayName: "Alphabet",
            },
            {
              name: "NASDAQ:META",
              displayName: "Meta Platforms",
            },
            {
              name: "NYSE:ORCL",
              displayName: "Oracle",
            },
            {
              name: "NYSE:IBM",
              displayName: "IBM",
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
