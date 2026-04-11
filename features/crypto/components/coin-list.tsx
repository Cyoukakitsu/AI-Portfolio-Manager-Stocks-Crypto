"use client";

import Script from "next/script";
import { useTheme } from "next-themes";

export function CoinList() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const bgColor = isDark ? "#09090b" : "#ffffff";
  const fontColor = isDark ? "#fafafa" : "#09090b";

  return (
    <>
      <Script
        src="https://widgets.coingecko.com/gecko-coin-list-widget.js"
        strategy="lazyOnload"
      />
      {/* @ts-ignore */}
      <gecko-coin-list-widget
        locale="en"
        outlined="false"
        coin-ids="bitcoin,ethereum,solana,dogecoin,ripple,cardano,polkadot,avalanche-2,chainlink,uniswap,shiba-inu,litecoin"
        currency="usd"
        background-color={bgColor}
        font-color={fontColor}
        positive-color="#16a34a"
        negative-color="#dc2626"
      />
    </>
  );
}
