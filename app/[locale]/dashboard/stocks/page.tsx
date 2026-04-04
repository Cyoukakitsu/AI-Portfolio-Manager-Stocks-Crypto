import { getTranslations } from "next-intl/server";
import AdvancedChart from "@/components/custom/stocks/advanced-chart";
import MarketDataStock from "@/components/custom/stocks/market-data-stock";
import StockHeatmap from "@/components/custom/stocks/stock-heatmap";
import TickerTape from "@/components/custom/stocks/ticker-tape";
import TopStories from "@/components/custom/stocks/top-stories";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  BarChart2,
  Flame,
  Globe,
  Newspaper,
  Radio,
  TrendingUp,
  Zap,
} from "lucide-react";

import { WidgetCard, StatChip } from "@/components/custom/dashboard/widget-card";

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default async function Stocks() {
  const t = await getTranslations("pages.stocks");

  return (
    <div className="min-w-0 w-full overflow-x-hidden flex flex-col gap-6 p-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
              <Activity className="h-4 w-4 text-violet-500" />
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
          <StatChip icon={BarChart2} label="S&P 500" accent="emerald" />
        </div>
      </div>

      {/* ── Row 1 — Ticker Tape ── */}
      <WidgetCard
        icon={Radio}
        title={t("liveTicker")}
        badge={t("streaming")}
        accent="amber"
      >
        <div className="py-2 px-4">
          <TickerTape />
        </div>
      </WidgetCard>

      {/* ── Row 2 — Advanced Chart ── */}
      <WidgetCard
        icon={TrendingUp}
        title={t("liveChart")}
        badge="AAPL"
        accent="violet"
        className="h-165"
      >
        <div className="h-full p-4">
          <AdvancedChart />
        </div>
      </WidgetCard>

      {/* ── Row 3 — Heatmap + Top Stories ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-w-0">
        <WidgetCard
          icon={Flame}
          title={t("heatmap")}
          badge="SPX500"
          accent="orange"
          className="xl:h-140"
        >
          <div className="h-full p-4">
            <StockHeatmap />
          </div>
        </WidgetCard>

        <WidgetCard
          icon={Newspaper}
          title={t("topStories")}
          badge="Reuters"
          accent="blue"
          className="xl:h-140"
        >
          <div className="h-full p-4">
            <TopStories />
          </div>
        </WidgetCard>
      </div>

      {/* ── Row 4 — Market Data ── */}
      <WidgetCard
        icon={BarChart2}
        title={t("marketData")}
        badge="S&P 500"
        accent="emerald"
        className="h-130"
      >
        <div className="h-full p-4">
          <MarketDataStock />
        </div>
      </WidgetCard>

      {/* ── Footer ── */}
      <div className="flex items-center justify-center gap-2 pb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p
          className="text-center text-xs text-muted-foreground"
          suppressHydrationWarning
        >
          {t("footer")}{new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}
