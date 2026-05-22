"use client";

import Script from "next/script";

export default function CoinCompareChart() {
  return (
    <>
      <Script
        src="https://widgets.coingecko.com/gecko-coin-price-chart-widget.js"
        strategy="lazyOnload"
      />
      <div className="w-full">
        {/* @ts-expect-error - CoinGecko custom elements are not in React JSX types */}
        <gecko-coin-price-chart-widget
          locale="en"
          outlined="true"
          initial-currency="usd"
          style={{ display: "block", width: "100%" }}
        />
      </div>
    </>
  );
}
