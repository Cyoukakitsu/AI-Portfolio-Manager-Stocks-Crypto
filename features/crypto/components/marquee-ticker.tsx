"use client";

import Script from "next/script";

export default function MarqueeTicker() {
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
