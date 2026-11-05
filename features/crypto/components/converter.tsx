"use client";

// CoinGecko 加密货币单位换算器 Widget 封装
import Script from "next/script";
import { useGeckoTheme } from "./use-gecko-theme";

export default function Converter() {
  const geckoTheme = useGeckoTheme();
  if (!geckoTheme) return null;
  const { themeKey, themeAttrs } = geckoTheme;
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
          {...themeAttrs}
          style={{ display: "block", width: "100%" }}
        />
      </div>
    </>
  );
}
