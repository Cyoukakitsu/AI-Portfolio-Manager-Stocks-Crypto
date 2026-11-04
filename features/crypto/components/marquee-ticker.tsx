"use client";

// TradingView 加密货币滚动行情栏 Widget 封装
import Script from "next/script";
import { useGeckoTheme } from "./use-gecko-theme";

export default function MarqueeTicker() {
  const { themeKey, attrs } = useGeckoTheme();
  return (
    <>
      <Script
        src="https://widgets.coingecko.com/gecko-coin-price-marquee-widget.js"
        strategy="lazyOnload"
      />
      <div className="w-full p-0 overflow-visible">
        {/* @ts-expect-error - CoinGecko custom elements are not in React JSX types */}
        <gecko-coin-price-marquee-widget
          locale="en"
          outlined="false"
          coin-ids="bitcoin,ethereum,solana,dogecoin,ripple,cardano,polkadot,avalanche-2,chainlink,uniswap"
          initial-currency="usd"
          key={themeKey}
          {...attrs}
          style={{ display: "block", width: "100%" }}
        />
      </div>
    </>
  );
}
