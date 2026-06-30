"use client";

// TradingView 加密货币实时报价列表 Widget 封装
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export default function MarketQuotes() {
  const container = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const colorTheme = resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    const widgetContainer = container.current;
    if (!widgetContainer) return;

    widgetContainer.innerHTML = `
      <div class="tradingview-widget-container__widget"></div>
      <div class="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/markets/?utm_source=www.tradingview.com&utm_medium=widget_new&utm_campaign=market-quotes" rel="noopener nofollow" target="_blank">
          <span class="blue-text">Market summary</span>
        </a>

      </div>`;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      title: "Cryptocurrencies",
      title_raw: "Cryptocurrencies",
      title_link: "/markets/cryptocurrencies/prices-all/",
      width: "100%",
      height: "100%",
      locale: "en",
      showSymbolLogo: true,
      symbolsGroups: [
        {
          name: "Overview",
          symbols: [
            { name: "CRYPTOCAP:TOTAL" },
            { name: "BITSTAMP:BTCUSD" },
            { name: "BITSTAMP:ETHUSD" },
            { name: "COINBASE:SOLUSD" },
            { name: "BINANCE:AVAXUSD" },
            { name: "COINBASE:UNIUSD" },
          ],
        },
        {
          name: "Bitcoin",
          symbols: [
            { name: "BITSTAMP:BTCUSD" },
            { name: "COINBASE:BTCEUR" },
            { name: "COINBASE:BTCGBP" },
            { name: "BITFLYER:BTCJPY" },
            { name: "BMFBOVESPA:BIT1!" },
          ],
        },
        {
          name: "Ethereum",
          symbols: [
            { name: "BITSTAMP:ETHUSD" },
            { name: "KRAKEN:ETHEUR" },
            { name: "COINBASE:ETHGBP" },
            { name: "BITFLYER:ETHJPY" },
            { name: "BINANCE:ETHBTC" },
            { name: "BINANCE:ETHUSDT" },
          ],
        },
        {
          name: "Solana",
          symbols: [
            { name: "COINBASE:SOLUSD" },
            { name: "BINANCE:SOLEUR" },
            { name: "COINBASE:SOLGBP" },
            { name: "BINANCE:SOLBTC" },
            { name: "COINBASE:SOLETH" },
            { name: "BINANCE:SOLUSDT" },
          ],
        },
        {
          name: "Uniswap",
          symbols: [
            { name: "COINBASE:UNIUSD" },
            { name: "KRAKEN:UNIEUR" },
            { name: "COINBASE:UNIGBP" },
            { name: "BINANCE:UNIBTC" },
            { name: "KRAKEN:UNIETH" },
            { name: "BINANCE:UNIUSDT" },
          ],
        },
      ],
      colorTheme,
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
