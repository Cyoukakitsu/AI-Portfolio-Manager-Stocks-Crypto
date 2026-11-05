"use client";

// TradingView 股票滚动行情栏 Widget 封装
import { useEffect } from "react";
import { useColorTheme } from "@/hooks/use-color-theme";

function TickerTape() {
  const theme = useColorTheme();

  useEffect(() => {
    const existing = document.querySelector(
      'script[src="https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js"]'
    );
    if (existing) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js";
    document.head.appendChild(script);

    return () => {
      script.parentNode?.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full overflow-hidden">
      {/* @ts-expect-error — Web Component not recognized by TypeScript */}
      <tv-ticker-tape key={theme} theme={theme} symbols="FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FOREXCOM:DJI,FX:EURUSD,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,CMCMARKETS:GOLD" />
    </div>
  );
}

export default TickerTape;
