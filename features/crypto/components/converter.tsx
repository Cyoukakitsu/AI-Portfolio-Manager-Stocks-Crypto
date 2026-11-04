"use client";

// TradingView 加密货币单位换算器 Widget 封装
import Script from "next/script";
import { useGeckoTheme } from "./use-gecko-theme";

export default function Converter() {
  const { themeKey, attrs } = useGeckoTheme();
  return (
    <>
      <Script
        src="https://widgets.coingecko.com/gecko-coin-converter-widget.js"
        strategy="lazyOnload"
      />
      <div className="w-full">
        {/* @ts-expect-error - CoinGecko custom elements are not in React JSX types */}
        <gecko-coin-converter-widget
          locale="en"
          outlined="false"
          coin-id="bitcoin"
          currency="usd"
          key={themeKey}
          {...attrs}
          style={{ display: "block", width: "100%" }}
        />
      </div>
    </>
  );
}
