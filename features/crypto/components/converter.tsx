"use client";

import Script from "next/script";
import { useWidgetColors } from "@/features/crypto/hooks/use-widget-colors";

export default function Converter() {
  const { bg, fg } = useWidgetColors();
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
