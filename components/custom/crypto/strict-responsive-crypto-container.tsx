"use client";

import Script from "next/script";
import { BarChart2, Flame, TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ─────────────────────────────────────────────
   Individual widget renderers
   Each widget is isolated in its own wrapper so
   overflow cannot escape the card boundary.
───────────────────────────────────────────── */

function MarqueeWidget() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const bg = dark ? "#09090b" : "#ffffff";
  const fg = dark ? "#fafafa" : "#09090b";

  return (
    // @ts-ignore
    <gecko-coin-price-marquee-widget
      locale="en"
      outlined="false"
      coin-ids="bitcoin,ethereum,solana,dogecoin,ripple,cardano,polkadot,avalanche-2,chainlink,uniswap"
      initial-currency="usd"
      background-color={bg}
      font-color={fg}
      positive-color="#16a34a"
      negative-color="#dc2626"
    />
  );
}

function HeatmapWidget() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const bg = dark ? "#09090b" : "#ffffff";
  const fg = dark ? "#fafafa" : "#09090b";

  return (
    // @ts-ignore
    <gecko-coin-heatmap-widget
      locale="en"
      outlined="false"
      top="100"
      height="500"
      background-color={bg}
      font-color={fg}
    />
  );
}

function CoinListWidget() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const bg = dark ? "#09090b" : "#ffffff";
  const fg = dark ? "#fafafa" : "#09090b";

  return (
    // @ts-ignore
    <gecko-coin-list-widget
      locale="en"
      outlined="false"
      coin-ids="bitcoin,ethereum,solana,dogecoin,ripple,cardano,polkadot,avalanche-2,chainlink,uniswap,shiba-inu,litecoin"
      currency="usd"
      background-color={bg}
      font-color={fg}
      positive-color="#16a34a"
      negative-color="#dc2626"
    />
  );
}

/* ─────────────────────────────────────────────
   StrictResponsiveCryptoContainer
   Root enforces overflow-x-hidden so no widget
   can blow out the page horizontally.
───────────────────────────────────────────── */

export function StrictResponsiveCryptoContainer() {
  return (
    /* Root — hard-clamp horizontal overflow */
    <div className="w-full overflow-x-hidden">
      {/* Lazy-load all three CoinGecko scripts once */}
      <Script
        src="https://widgets.coingecko.com/gecko-coin-price-marquee-widget.js"
        strategy="lazyOnload"
      />
      <Script
        src="https://widgets.coingecko.com/gecko-coin-heatmap-widget.js"
        strategy="lazyOnload"
      />
      <Script
        src="https://widgets.coingecko.com/gecko-coin-list-widget.js"
        strategy="lazyOnload"
      />

      <div className="flex flex-col gap-6 p-6">
        {/* ── Page header ── */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Crypto Market Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time prices, heatmap, and top movers
          </p>
        </div>

        {/* ── Marquee — full width ── */}
        <Card className="w-full max-w-full overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3 border-b">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">
              Live Prices
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 w-full max-w-full overflow-hidden">
            <div className="w-full max-w-full overflow-hidden">
              <MarqueeWidget />
            </div>
          </CardContent>
        </Card>

        {/* ── Heatmap (2fr) + Coin List (1fr) ──
            Mobile  → single column stack
            md+     → [heatmap | coin-list] at 2:1 ratio via grid template
        ── */}
        <div
          className="
            grid w-full max-w-full gap-6
            grid-cols-1
            md:grid-cols-[2fr_1fr]
          "
        >
          {/* Heatmap */}
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3 border-b">
              <Flame className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">
                Market Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 w-full max-w-full overflow-hidden">
              <div className="w-full max-w-full overflow-hidden">
                <HeatmapWidget />
              </div>
            </CardContent>
          </Card>

          {/* Coin List */}
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3 border-b">
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">
                Top Coins
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 w-full max-w-full overflow-y-auto overflow-x-hidden">
              <div className="w-full max-w-full overflow-hidden">
                <CoinListWidget />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-xs text-muted-foreground pb-2">
          Powered by CoinGecko &middot; Updated{" "}
          {new Date().toLocaleString("en-US")}
        </p>
      </div>
    </div>
  );
}
