"use client";

import Script from "next/script";

export default function CoinCompareChart() {
  return (
    <>
      <Script
        src="https://widgets.coingecko.com/gecko-coin-compare-chart-widget.js"
        strategy="lazyOnload"
      />
      <div className="w-full">
        {/* @ts-expect-error - CoinGecko custom elements are not in React JSX types */}
        <gecko-coin-compare-chart-widget
          locale="en"
          outlined="false"
          coin-ids="bitcoin"
          currency="usd"
          height="520"
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
