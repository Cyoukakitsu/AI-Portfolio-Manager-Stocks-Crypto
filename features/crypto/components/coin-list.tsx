"use client";

// CoinGecko 加密货币列表 Widget 封装
import Script from "next/script";
import { useGeckoTheme } from "./use-gecko-theme";

export default function CoinList() {
  const geckoTheme = useGeckoTheme();
  if (!geckoTheme) return null;
  const { themeKey, themeAttrs } = geckoTheme;
  return (
    <>
      <Script
        src="https://widgets.coingecko.com/gecko-coin-list-widget.js"
        strategy="lazyOnload"
      />
      <div className="w-full">
        {/* @ts-expect-error - CoinGecko custom elements are not in React JSX types */}
        <gecko-coin-list-widget
          locale="en"
          outlined="false"
          coin-ids="bitcoin,ethereum,solana,dogecoin,ripple,cardano,polkadot,avalanche-2,chainlink,uniswap,shiba-inu,litecoin"
          currency="usd"
          key={themeKey}
          {...themeAttrs}
          style={{ display: "block", width: "100%" }}
        />
      </div>
    </>
  );
}
