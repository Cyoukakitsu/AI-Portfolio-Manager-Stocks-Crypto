"use client";

import Script from "next/script";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import {
  BarChart2,
  ArrowLeftRight,
  Flame,
  LineChart,
  TrendingUp,
  Activity,
  Globe,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ─────────────────────────────────────────
   Theme-aware color hook
───────────────────────────────────────── */
function useWidgetColors() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return {
    bg: dark ? "#09090b" : "#ffffff",
    fg: dark ? "#fafafa" : "#09090b",
  };
}

/* ─────────────────────────────────────────
   Widget components with fixed heights
───────────────────────────────────────── */
function MarqueeWidget() {
  const { bg, fg } = useWidgetColors();
  return (
    <div className="w-full p-0 overflow-visible">
      {/* @ts-expect-error - CoinGecko custom elements are not in React JSX types */}
      <gecko-coin-price-marquee-widget
        locale="en"
        outlined="false"
        coin-ids="bitcoin,ethereum,solana,dogecoin,ripple,cardano,polkadot,avalanche-2,chainlink,uniswap"
        initial-currency="usd"
        background-color={bg}
        font-color={fg}
        positive-color="#16a34a"
        negative-color="#dc2626"
        style={{ display: "block", width: "100%" }}
      />
    </div>
  );
}

function HeatmapWidget() {
  const { bg, fg } = useWidgetColors();
  return (
    <div className="w-full">
      {/* @ts-expect-error - CoinGecko custom elements are not in React JSX types */}
      <gecko-coin-heatmap-widget
        locale="en"
        outlined="false"
        top="100"
        height="520"
        background-color={bg}
        font-color={fg}
        style={{ display: "block", width: "100%" }}
      />
    </div>
  );
}

function CoinListWidget() {
  const { bg, fg } = useWidgetColors();
  return (
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
  );
}

function CoinCompareChartWidget() {
  const { bg, fg } = useWidgetColors();
  return (
    <div className="w-full">
      {/* @ts-expect-error - CoinGecko custom elements are not in React JSX types */}
      <gecko-coin-compare-chart-widget
        locale="en"
        outlined="false"
        coin-ids="bitcoin"
        currency="usd"
        height="520"
        background-color={bg}
        font-color={fg}
        positive-color="#16a34a"
        negative-color="#dc2626"
        style={{ display: "block", width: "100%" }}
      />
    </div>
  );
}

function ConverterWidget() {
  const { bg, fg } = useWidgetColors();
  return (
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
  );
}

import {
  WidgetCard,
  StatChip,
} from "@/components/custom/dashboard/widget-card";

/* ─────────────────────────────────────────
   CryptoMarketDashboard
───────────────────────────────────────── */
export function CryptoMarketDashboard() {
  const t = useTranslations("pages.crypto");
  return (
    <div className="min-w-0 w-full overflow-x-hidden flex flex-col gap-6 p-6">
      {/* ── Scripts ── */}
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
      <Script
        src="https://widgets.coingecko.com/gecko-coin-compare-chart-widget.js"
        strategy="lazyOnload"
      />
      <Script
        src="https://widgets.coingecko.com/gecko-coin-converter-widget.js"
        strategy="lazyOnload"
      />

      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Activity className="h-4.5 w-4.5 text-amber-500" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-10.5">
            {t("subtitle")}
          </p>
        </div>

        {/* stat chips */}
        <div className="flex flex-wrap gap-2">
          <StatChip icon={Globe} label={t("globalData")} accent="blue" />
          <StatChip icon={Zap} label={t("liveUpdates")} accent="amber" />
          <StatChip
            icon={TrendingUp}
            label={t("top100Coins")}
            accent="emerald"
          />
        </div>
      </div>

      {/* ── Row 1 — Marquee ticker ── */}
      <WidgetCard
        icon={TrendingUp}
        title={t("livePrices")}
        badge={t("streaming")}
        accent="amber"
      >
        <MarqueeWidget />
      </WidgetCard>

      {/* ── Row 2 — Compare Chart 1/2 + Heatmap 1/2 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-w-0">
        <WidgetCard
          icon={LineChart}
          title={t("coinCompareChart")}
          badge="BTC"
          accent="violet"
          className="xl:h-145"
        >
          <CoinCompareChartWidget />
        </WidgetCard>

        <WidgetCard
          icon={Flame}
          title={t("marketHeatmap")}
          badge="Top 100"
          accent="orange"
          className="xl:h-145"
        >
          <HeatmapWidget />
        </WidgetCard>
      </div>

      {/* ── Row 3 — Converter 2/3 + Coin List 1/3 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0 items-start">
        <WidgetCard
          icon={ArrowLeftRight}
          title={t("converter")}
          badge="BTC / USD"
          accent="emerald"
          className="lg:col-span-2"
          contentClassName="overflow-visible"
        >
          <ConverterWidget />
        </WidgetCard>

        <WidgetCard
          icon={BarChart2}
          title={t("topCoins")}
          badge="12 Assets"
          accent="blue"
          className="lg:col-span-1"
          contentClassName="overflow-visible"
        >
          <CoinListWidget />
        </WidgetCard>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-center gap-2 pb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p
          className="text-center text-xs text-muted-foreground"
          suppressHydrationWarning
        >
          Powered by CoinGecko &middot; Updated{" "}
          {new Date().toLocaleString("en-US")}
        </p>
      </div>
    </div>
  );
}
