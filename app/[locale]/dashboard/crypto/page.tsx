import { getTranslations } from "next-intl/server";
import {
  Activity,
  ArrowLeftRight,
  BarChart2,
  BarChart3,
  Flame,
  Globe,
  LineChart,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  WidgetCard,
  StatChip,
} from "@/features/dashboard/components/widget-card";
import MarqueeTicker from "@/features/crypto/components/marquee-ticker";
import CoinCompareChart from "@/features/crypto/components/coin-compare-chart";
import CryptoHeatmap from "@/features/crypto/components/crypto-heatmap";
import Converter from "@/features/crypto/components/converter";
import CoinList from "@/features/crypto/components/coin-list";
import MarketQuotes from "@/features/crypto/components/market-quotes";
import MarketOverview from "@/features/crypto/components/market-overview";

export default async function CryptoPage() {
  const t = await getTranslations("pages.crypto");

  return (
    <div className="min-w-0 w-full overflow-x-hidden flex flex-col gap-6 p-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-4.5 w-4.5 text-primary" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-10.5">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatChip icon={Globe} label={t("globalData")} accent="primary" />
          <StatChip icon={Zap} label={t("liveUpdates")} accent="primary" />
        </div>
      </div>

      {/* ── Row 1 — Marquee ticker ── */}
      <WidgetCard
        icon={TrendingUp}
        title={t("livePrices")}
        badge={t("streaming")}
        accent="primary"
      >
        <MarqueeTicker />
      </WidgetCard>

      {/* ── Row 2 — Compare Chart + Crypto Heatmap ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-w-0">
        <WidgetCard
          icon={LineChart}
          title={t("coinCompareChart")}
          badge="BTC"
          accent="primary"
          className="xl:h-145"
        >
          <CoinCompareChart />
        </WidgetCard>

        <WidgetCard
          icon={Flame}
          title={t("marketHeatmap")}
          badge="Top 100"
          accent="primary"
          className="xl:h-145"
        >
          <div className="h-full p-4">
            <CryptoHeatmap />
          </div>
        </WidgetCard>
      </div>

      {/* ── Row 3 — Converter + Coin List ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        <WidgetCard
          icon={ArrowLeftRight}
          title={t("converter")}
          badge="BTC / USD"
          accent="primary"
          className="lg:col-span-1"
          contentClassName="overflow-visible"
        >
          <Converter />
        </WidgetCard>

        <WidgetCard
          icon={BarChart2}
          title={t("topCoins")}
          badge="12 Assets"
          accent="primary"
          className="lg:col-span-2"
          contentClassName="overflow-visible"
        >
          <CoinList />
        </WidgetCard>
      </div>

      {/* ── Row 4 — Market Quotes (1/3) + Market Overview (2/3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        <WidgetCard
          icon={BarChart3}
          title="Market Quotes"
          badge="Crypto"
          accent="primary"
          className="lg:col-span-1 lg:h-160"
        >
          <div className="h-full p-4">
            <MarketQuotes />
          </div>
        </WidgetCard>

        <WidgetCard
          icon={Globe}
          title="Market Overview"
          badge="Crypto"
          accent="primary"
          className="lg:col-span-2 lg:h-160"
        >
          <div className="h-full p-4">
            <MarketOverview />
          </div>
        </WidgetCard>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-center gap-2 pb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p
          className="text-center text-xs text-muted-foreground"
          suppressHydrationWarning
        >
          Powered by CoinGecko &amp; TradingView &middot; Updated{" "}
          {new Date().toLocaleString("en-US")}
        </p>
      </div>
    </div>
  );
}
