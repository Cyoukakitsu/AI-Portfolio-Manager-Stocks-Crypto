import React from "react";
import { getAssets } from "@/server/assets";
import { getAllTransactions } from "@/server/transactions";

import { AssetsTable } from "@/components/custom/assets/data-table";
import { AssetForm } from "@/components/custom/assets/data-form";
import { TotalAssetCard } from "@/components/custom/assets/total-asset-card";
import { PortfolioCandlestickChart } from "@/components/custom/assets/portfolio-candlestick-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Database, Newspaper, Bot } from "lucide-react";
import { DailyAnalysis } from "@/components/custom/assets/daily-analysis";
import { PortfolioAISummary } from "@/components/custom/assets/portfolio-ai-summary";

/* ─────────────────────────────────────────
   Icon accent colours  (mirrors stocks page)
───────────────────────────────────────── */
const iconStyles: Record<string, string> = {
  amber:
    "bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400",
  violet:
    "bg-violet-500/10 text-violet-500 dark:bg-violet-400/10 dark:text-violet-400",
  emerald:
    "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400",
  blue: "bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400",
  orange:
    "bg-orange-500/10 text-orange-500 dark:bg-orange-400/10 dark:text-orange-400",
};

/* ─────────────────────────────────────────
   WidgetCard  (mirrors stocks page)
───────────────────────────────────────── */
function WidgetCard({
  icon: Icon,
  title,
  badge,
  accent = "amber",
  action,
  children,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  accent?: keyof typeof iconStyles;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "group min-w-0 w-full rounded-xl border border-border/60",
        "bg-card shadow-sm transition-shadow duration-200 hover:shadow-md",
        "flex flex-col",
        className,
      ].join(" ")}
    >
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
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-0 w-full flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default async function Assets() {
  const assets = await getAssets();
  const list = assets ?? [];
  const allTransactions = await getAllTransactions();

  return (
    <div className="min-w-0 w-full overflow-x-hidden flex flex-col gap-6 p-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <LayoutDashboard className="h-4 w-4 text-amber-500" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">
              Personal Portfolio
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pl-10.5">
            Track your holdings, returns &amp; allocations in real time
          </p>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid gap-4 grid-cols-3">
        <div className="col-span-2">
          <TotalAssetCard assets={list} />
        </div>
        <WidgetCard icon={Bot} title="AI Portfolio Summary" accent="amber">
          <PortfolioAISummary assets={list} />
        </WidgetCard>
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
          <WidgetCard icon={Newspaper} title="Daily Analysis" accent="violet">
            <DailyAnalysis assets={list} />
          </WidgetCard>
        </div>
      </div>

      {/* ── Assets table ── */}
      <WidgetCard
        icon={Database}
        title="All Assets"
        badge={list.length > 0 ? `${list.length}` : undefined}
        accent="blue"
        action={<AssetForm trigger={<Button size="sm">Add Asset</Button>} />}
      >
        <div className="p-4">
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
          Live data via Yahoo Finance &middot; Updated{" "}
          {new Date().toLocaleString("en-US")}
        </p>
      </div>
    </div>
  );
}
