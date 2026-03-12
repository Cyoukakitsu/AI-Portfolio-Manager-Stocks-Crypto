"use client";

import Script from "next/script";
import { useTheme } from "next-themes";
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
      {/* @ts-ignore */}
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
      {/* @ts-ignore */}
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
      {/* @ts-ignore */}
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
      {/* @ts-ignore */}
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
      {/* @ts-ignore */}
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

/* ─────────────────────────────────────────
   Icon accent colours
───────────────────────────────────────── */
const iconStyles: Record<string, string> = {
  amber:
    "bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400",
  orange:
    "bg-orange-500/10 text-orange-500 dark:bg-orange-400/10 dark:text-orange-400",
  blue: "bg-blue-500/10  text-blue-500  dark:bg-blue-400/10  dark:text-blue-400",
  violet:
    "bg-violet-500/10 text-violet-500 dark:bg-violet-400/10 dark:text-violet-400",
  emerald:
    "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400",
};

/* ─────────────────────────────────────────
   Card shell
   - 外层卡片不设 overflow-hidden，让 widget 内部下拉菜单可以飞出边界
   - 内容区 p-0 贴边，widget 贴边撑满
   - 高度由 widget 自身撑满，消除底部空白
───────────────────────────────────────── */
function WidgetCard({
  icon: Icon,
  title,
  badge,
  accent = "amber",
  children,
  className = "",
  contentClassName = "",
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  accent?: keyof typeof iconStyles;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={[
        "group min-w-0 w-full rounded-xl border border-border/60 overflow-hidden",
        "bg-card shadow-sm transition-shadow duration-200 hover:shadow-md",
        "flex flex-col",
        className,
      ].join(" ")}
    >
      {/* header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/60">
        <span
          className={`flex items-center justify-center h-7 w-7 rounded-lg shrink-0 ${iconStyles[accent]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight flex-1 truncate">
          {title}
        </span>
        {badge && (
          <Badge
            variant="secondary"
            className="text-[10px] px-2 py-0.5 font-medium shrink-0"
          >
            {badge}
          </Badge>
        )}
      </div>

      {/* 内容区：p-0 贴边，w-full h-full 撑满，消除底部空白 */}
      <div className={`p-0 w-full flex-1 overflow-hidden ${contentClassName}`}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Stat chip
───────────────────────────────────────── */
function StatChip({
  icon: Icon,
  label,
  accent = "amber",
}: {
  icon: React.ElementType;
  label: string;
  accent?: keyof typeof iconStyles;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5">
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full ${iconStyles[accent]}`}
      >
        <Icon className="h-3 w-3" />
      </span>
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────
   CryptoMarketDashboard
───────────────────────────────────────── */
export function CryptoMarketDashboard() {
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
            <h1 className="text-2xl font-bold tracking-tight">
              Crypto Markets
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pl-10.5">
            Real-time prices, heatmaps, charts &amp; conversion tools
          </p>
        </div>

        {/* stat chips */}
        <div className="flex flex-wrap gap-2">
          <StatChip icon={Globe} label="Global Data" accent="blue" />
          <StatChip icon={Zap} label="Live Updates" accent="amber" />
          <StatChip icon={TrendingUp} label="Top 100 Coins" accent="emerald" />
        </div>
      </div>

      {/* ── Row 1 — Marquee ticker ── */}
      <WidgetCard
        icon={TrendingUp}
        title="Live Prices"
        badge="Streaming"
        accent="amber"
      >
        <MarqueeWidget />
      </WidgetCard>

      {/* ── Row 2 — Compare Chart 1/2 + Heatmap 1/2 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-w-0">
        <WidgetCard
          icon={LineChart}
          title="Coin Compare Chart"
          badge="BTC"
          accent="violet"
          className="xl:h-[580px]"
        >
          <CoinCompareChartWidget />
        </WidgetCard>

        <WidgetCard
          icon={Flame}
          title="Market Heatmap"
          badge="Top 100"
          accent="orange"
          className="xl:h-[580px]"
        >
          <HeatmapWidget />
        </WidgetCard>
      </div>

      {/* ── Row 3 — Converter 2/3 + Coin List 1/3 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0 items-start">
        <WidgetCard
          icon={ArrowLeftRight}
          title="Converter"
          badge="BTC / USD"
          accent="emerald"
          className="lg:col-span-2"
          contentClassName="overflow-visible"
        >
          <ConverterWidget />
        </WidgetCard>

        <WidgetCard
          icon={BarChart2}
          title="Top Coins"
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
        <p className="text-center text-xs text-muted-foreground" suppressHydrationWarning>
          Powered by CoinGecko &middot; Updated{" "}
          {new Date().toLocaleString("en-US")}
        </p>
      </div>
    </div>
  );
}
