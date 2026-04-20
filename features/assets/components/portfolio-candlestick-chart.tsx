"use client";

// 组合资产 K 线图 / 收益率面积图
// 逻辑层见 hooks/use-portfolio-candlestick-chart.ts
// 计算层见 lib/portfolio-ohlc.ts

import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { Asset, Transaction } from "@/types/global";
import {
  usePortfolioCandlestickChart,
  RANGES,
} from "@/features/assets/hooks/use-portfolio-candlestick-chart";

type Props = {
  assets: Asset[];
  allTransactions: Transaction[];
};

export function PortfolioCandlestickChart({ assets, allTransactions }: Props) {
  const {
    range,
    setRange,
    view,
    setView,
    chartContainerRef,
    isFetching,
    chartData,
  } = usePortfolioCandlestickChart({ assets, allTransactions });

  return (
    <motion.div
      className="group rounded-xl border border-border/60 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" as const }}
    >
      {/* 卡片顶栏：标题 + 视图切换按钮 */}
      <div className="flex flex-wrap items-center gap-2 px-3 sm:px-5 py-3 sm:py-3.5 border-b border-border/60">
        <span className="flex items-center justify-center h-7 w-7 rounded-lg shrink-0 bg-primary/10 text-primary">
          <TrendingUp className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight flex-1 truncate">
          Portfolio Value
        </span>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* USD / 收益率 切换 */}
          <div className="flex rounded-md border border-border/60 overflow-hidden">
            <Button
              variant={view === "usd" ? "default" : "ghost"}
              size="sm"
              className="rounded-none text-xs px-2 sm:px-3"
              onClick={() => setView("usd")}
            >
              USD
            </Button>
            <Button
              variant={view === "pct" ? "default" : "ghost"}
              size="sm"
              className="rounded-none text-xs px-2 sm:px-3"
              onClick={() => setView("pct")}
            >
              %
            </Button>
          </div>

          {/* 时间范围切换 */}
          <div className="flex gap-0.5 sm:gap-1">
            {RANGES.map((r) => (
              <Button
                key={r}
                variant={range === r ? "default" : "ghost"}
                size="sm"
                className="text-xs px-1.5 sm:px-2"
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="p-2 sm:p-4 flex-1">
        {isFetching ? (
          <div className="flex items-center justify-center h-52 sm:h-87.5 text-muted-foreground text-sm">
            Loading...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-52 sm:h-87.5 text-muted-foreground text-sm">
            No data
          </div>
        ) : (
          <div ref={chartContainerRef} className="w-full" />
        )}
      </div>
    </motion.div>
  );
}
