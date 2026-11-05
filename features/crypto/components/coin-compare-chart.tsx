"use client";

// CoinGecko 加密货币对比走势图 Widget 封装
import Script from "next/script";
import { useGeckoTheme } from "./use-gecko-theme";

export default function CoinCompareChart() {
  const geckoTheme = useGeckoTheme();
  if (!geckoTheme) return null;
  const { themeKey, themeAttrs } = geckoTheme;
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
          key={themeKey}
          {...themeAttrs}
          style={{ display: "block", width: "100%" }}
        />
      </div>
    </>
  );
}
