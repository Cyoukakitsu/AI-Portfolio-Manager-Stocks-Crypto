"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  IChartApi,
  ISeriesApi,
  ColorType,
} from "lightweight-charts";

import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { Asset, Transaction } from "@/types/global";

type Props = {
  assets: Asset[];
  allTransactions: Transaction[];
};

type Range = "1M" | "6M" | "1Y" | "YTD" | "MAX";
const RANGES: Range[] = ["1M", "6M", "1Y", "YTD", "MAX"];

type OHLCPoint = {
  time: string; // "YYYY-MM-DD"
  open: number;
  high: number;
  low: number;
  close: number;
};

function getFromDate(range: Range, firstTransactionDate?: string): string {
  const now = new Date();

  if (range === "YTD") {
    return `${now.getFullYear()}-01-01`;
  }

  if (range === "MAX") {
    return firstTransactionDate ?? "2020-01-01";
  }

  const daysMap: Record<Range, number> = {
    "1M": 30,
    "6M": 180,
    "1Y": 365,
    YTD: 0,
    MAX: 0,
  };

  const from = new Date(now.getTime() - daysMap[range] * 24 * 60 * 60 * 1000);
  return from.toISOString().split("T")[0];
}

export function PortfolioCandlestickChart({ assets, allTransactions }: Props) {
  const [range, setRange] = useState<Range>("1M");
  const [view, setView] = useState<"usd" | "pct">("usd");

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<
    ISeriesApi<"Candlestick"> | ISeriesApi<"Area"> | null
  >(null);

  // 1. 分离 cash 和可交易资产（仅用于 fetch，不含计算逻辑）
  const cashAssets = assets.filter((a) => a.asset_type === "cash");
  const tradableAssets = assets.filter((a) => a.asset_type !== "cash");
  const totalCost = assets.reduce((sum, a) => sum + a.total_cost, 0);
  const symbolsKey = tradableAssets.map((a) => a.symbol).join(",");

  // 2. useQuery 只负责拉取原始 OHLCV 数据，按 range+symbols 缓存
  const { data: historyData, isFetching } = useQuery({
    queryKey: ["history", symbolsKey, range],
    queryFn: async () => {
      const from = getFromDate(range);
      const to = new Date().toISOString().split("T")[0];
      const res = await fetch(
        `/api/yahoofinance/history?symbols=${symbolsKey}&from=${from}&to=${to}`,
      );
      return res.json();
    },
    enabled: tradableAssets.length > 0 && allTransactions.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // 3. 计算 chartData：historyData 或 allTransactions 变化时重新计算
  const chartData = ((): OHLCPoint[] => {
    if (!historyData?.results) return [];

    const cashValue = cashAssets.reduce((sum, a) => sum + a.total_cost, 0);

    // 建 priceMap：key = "AAPL-2024-01-01"
    const priceMap = new Map<
      string,
      { open: number; high: number; low: number; close: number }
    >();

    (
      historyData.results as {
        symbol: string;
        candles: {
          date: string;
          open: number;
          high: number;
          low: number;
          close: number;
        }[];
      }[]
    ).forEach(({ symbol, candles }) => {
      candles.forEach((c) => {
        priceMap.set(`${symbol}-${c.date}`, {
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        });
      });
    });

    // 收集所有日期并排序
    const allDates = [
      ...new Set(
        (historyData.results as { candles: { date: string }[] }[]).flatMap(
          (r) => r.candles.map((c) => c.date),
        ),
      ),
    ].sort();

    // 按日期聚合持仓 OHLC
    const holdingMap = new Map<string, { quantity: number; cost: number }>();
    const txByAsset = new Map<string, Transaction[]>();

    allTransactions.forEach((tx) => {
      const list = txByAsset.get(tx.asset_id) ?? [];
      list.push(tx);
      txByAsset.set(tx.asset_id, list);
    });

    // 预填充：处理所有发生在图表日期范围之前的交易
    if (allDates.length > 0) {
      tradableAssets.forEach((asset) => {
        const preDateTx = (txByAsset.get(asset.id) ?? []).filter(
          (tx) => tx.traded_at < allDates[0],
        );
        preDateTx.sort((a, b) => a.traded_at.localeCompare(b.traded_at));

        preDateTx.forEach((tx) => {
          const cur = holdingMap.get(asset.id) ?? { quantity: 0, cost: 0 };
          if (tx.type === "buy") {
            holdingMap.set(asset.id, {
              quantity: cur.quantity + tx.quantity,
              cost: cur.cost + tx.price * tx.quantity,
            });
          } else {
            const ratio = tx.quantity / cur.quantity;
            holdingMap.set(asset.id, {
              quantity: cur.quantity - tx.quantity,
              cost: cur.cost * (1 - ratio),
            });
          }
        });
      });
    }

    return allDates.map((date, index) => {
      tradableAssets.forEach((asset) => {
        const txToProcess = (txByAsset.get(asset.id) ?? []).filter((tx) => {
          if (index === 0) return tx.traded_at === date;
          // 处理落在两个交易日之间的交易（周末/节假日）
          return tx.traded_at > allDates[index - 1] && tx.traded_at <= date;
        });

        txToProcess
          .sort((a, b) => a.traded_at.localeCompare(b.traded_at))
          .forEach((tx) => {
            const cur = holdingMap.get(asset.id) ?? { quantity: 0, cost: 0 };
            if (tx.type === "buy") {
              holdingMap.set(asset.id, {
                quantity: cur.quantity + tx.quantity,
                cost: cur.cost + tx.price * tx.quantity,
              });
            } else {
              const ratio = tx.quantity / cur.quantity;
              holdingMap.set(asset.id, {
                quantity: cur.quantity - tx.quantity,
                cost: cur.cost * (1 - ratio),
              });
            }
          });
      });

      // 当日组合 OHLC = Σ(持仓数量 × 价格) + cash
      let open = cashValue,
        high = cashValue,
        low = cashValue,
        close = cashValue;

      tradableAssets.forEach((asset) => {
        const holding = holdingMap.get(asset.id);
        if (!holding || holding.quantity === 0) return;
        const price = priceMap.get(`${asset.symbol}-${date}`);
        if (!price) return;

        open += holding.quantity * price.open;
        high += holding.quantity * price.high;
        low += holding.quantity * price.low;
        close += holding.quantity * price.close;
      });

      return { time: date, open, high, low, close };
    });
  })();

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    // 每次重新渲染前清除旧 chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    // 创建 chart 实例
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 350,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#888",
      },
      grid: {
        vertLines: { color: "rgba(0,0,0,0.05)" },
        horzLines: { color: "rgba(0,0,0,0.05)" },
      },
      timeScale: {
        borderColor: "rgba(0,0,0,0.1)",
        // ✅ 新增：不把时间轴右侧留白压缩
        rightOffset: 5,
        // ✅ 新增：让蜡烛不会太细，最小宽度保证可读性
        minBarSpacing: 2,
      },
      rightPriceScale: {
        borderColor: "rgba(0,0,0,0.1)",
        // ✅ 关键：不从 0 开始，让 Y 轴自动贴合数据范围
      },
    });

    chartRef.current = chart;

    if (view === "usd") {
      // K 线图
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });
      series.setData(chartData);

      // ✅ 在 series 上设置 scaleMargins，让 Y 轴贴合数据范围
      series.priceScale().applyOptions({
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      });

      seriesRef.current = series;
    } else {
      // 收益率面积图

      const areaData = chartData.map((p) => ({
        time: p.time,
        value:
          totalCost > 0
            ? parseFloat((((p.close - totalCost) / totalCost) * 100).toFixed(2))
            : 0,
      }));

      const series = chart.addSeries(AreaSeries, {
        lineColor: "#6366f1",
        topColor: "rgba(99,102,241,0.3)",
        bottomColor: "rgba(99,102,241,0)",
      });
      series.setData(areaData);

      // ✅ 同样在 series 上设置 scaleMargins
      series.priceScale().applyOptions({
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      });

      seriesRef.current = series;
    }

    chart.timeScale().fitContent();

    // 响应式：容器宽度变化时自动调整
    const observer = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    });
    observer.observe(chartContainerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [chartData, view, totalCost]);
  return (
    <motion.div
      className="group rounded-xl border border-border/60 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" as const }}
    >
      {/* WidgetCard header */}
      <div className="flex flex-wrap items-center gap-2 px-3 sm:px-5 py-3 sm:py-3.5 border-b border-border/60">
        <span className="flex items-center justify-center h-7 w-7 rounded-lg shrink-0 bg-violet-500/10 text-violet-500 dark:bg-violet-400/10 dark:text-violet-400">
          <TrendingUp className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight flex-1 truncate">
          Portfolio Value
        </span>

        {/* controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* USD / % 切换 */}
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

      {/* chart content */}
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
