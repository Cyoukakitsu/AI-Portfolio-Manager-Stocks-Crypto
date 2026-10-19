"use client";

// TradingView 加密货币单位换算器 Widget 封装
import Script from "next/script";

export default function Converter() {
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
          background-color="#ffffff"
          font-color="#09090b"
          positive-color="#16a34a"
          negative-color="#dc2626"
          style={{ display: "block", width: "100%" }}
        />
      </div>
    </>
  );
}
