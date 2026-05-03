"use client";

import Script from "next/script";
import { useWidgetColors } from "@/features/crypto/hooks/use-widget-colors";

export default function CoinList() {
  const { bg, fg } = useWidgetColors();
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
          background-color={bg}
          font-color={fg}
          positive-color="#16a34a"
          negative-color="#dc2626"
          style={{ display: "block", width: "100%" }}
        />
      </div>
    </>
  );
}
