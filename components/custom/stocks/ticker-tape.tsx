"use client";

import { useEffect, useRef, memo } from "react";

function TickerTape() {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;

    const existing = document.querySelector(
      'script[src="https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js"]'
    );
    if (existing) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js";
    document.head.appendChild(script);
    scriptLoaded.current = true;

    return () => {
      document.head.removeChild(script);
      scriptLoaded.current = false;
    };
  }, []);

  return (
    <div className="w-full overflow-hidden">
      {/* @ts-expect-error — Web Component not recognized by TypeScript */}
      <tv-ticker-tape symbols="FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FOREXCOM:DJI,FX:EURUSD,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,CMCMARKETS:GOLD" />
    </div>
  );
}

export default memo(TickerTape);
