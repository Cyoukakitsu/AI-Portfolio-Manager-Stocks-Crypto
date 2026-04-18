import { getTranslations } from "next-intl/server";
import { getAssets } from "@/features/assets/server/assets";
import { getAllTransactions } from "@/features/assets/server/transactions";

import { AssetsTable } from "@/features/assets/components/data-table";
import { AssetForm } from "@/features/assets/components/data-form";
import { TotalAssetCard } from "@/features/assets/components/total-asset-card";
import { PortfolioCandlestickChart } from "@/features/assets/components/portfolio-candlestick-chart";
import { DailyAnalysis } from "@/features/assets/components/daily-analysis";
import { PortfolioAISummary } from "@/features/assets/components/portfolio-ai-summary";
import { WidgetCard } from "@/features/dashboard/components/widget-card";

import { LayoutDashboard, Database, Newspaper, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Assets() {
  const t = await getTranslations("pages.assets");
  const [assets, allTransactions] = await Promise.all([
    getAssets(),
    getAllTransactions(),
  ]);
  const list = assets ?? [];

  return (
    <div className="min-w-0 w-full overflow-x-hidden flex flex-col gap-4 sm:gap-6 p-3 sm:p-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-10.5">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <TotalAssetCard assets={list} />
        </div>
        <div className="sm:col-span-1">
        <WidgetCard icon={Bot} title={t("aiSummaryWidget")} accent="primary">
          <PortfolioAISummary assets={list} />
        </WidgetCard>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <PortfolioCandlestickChart
            assets={list}
            allTransactions={allTransactions}
          />
        </div>
        <div className="md:col-span-1">
          <WidgetCard
            icon={Newspaper}
            title={t("dailyAnalysisWidget")}
            accent="primary"
          >
            <DailyAnalysis assets={list} />
          </WidgetCard>
        </div>
      </div>

      {/* ── Assets table ── */}
      <WidgetCard
        icon={Database}
        title={t("allAssetsWidget")}
        badge={list.length > 0 ? `${list.length}` : undefined}
        accent="primary"
        action={
          <AssetForm trigger={<Button size="sm">{t("addAsset")}</Button>} />
        }
      >
        <div className="p-2 sm:p-4">
          <AssetsTable assets={list} />
        </div>
      </WidgetCard>

      {/* ── Footer ── */}
      <div className="flex items-center justify-center gap-2 pb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />

        <p
          className="text-center text-xs text-muted-foreground"
          suppressHydrationWarning
        >
          {t("footer")}
          {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}
