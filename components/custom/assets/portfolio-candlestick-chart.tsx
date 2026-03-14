"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  IChartApi,
  ISeriesApi,
  ColorType,
} from "lightweight-charts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

function getFromDate(range: Range): string {
  const now = new Date();

  if (range === "YTD") {
    return `${now.getFullYear()}-01-01`;
  }

  if (range === "MAX") {
    return "1900-01-01";
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
  const [chartData, setChartData] = useState<OHLCPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<
    ISeriesApi<"Candlestick"> | ISeriesApi<"Area"> | null
  >(null);

  useEffect(() => {
    if (assets.length === 0 || allTransactions.length === 0) return;

    async function fetchAndCompute() {
      setLoading(true);
      try {
        // 1. 分离 cash 和可交易资产
        const cashAssets = assets.filter((a) => a.asset_type === "cash");
        const tradableAssets = assets.filter((a) => a.asset_type !== "cash");

        // cash 价值固定不变，直接用 total_cost
        const cashValue = cashAssets.reduce((sum, a) => sum + a.total_cost, 0);

        if (tradableAssets.length === 0) return;

        // 2. 并行拉取所有资产 OHLCV
        const symbols = tradableAssets.map((a) => a.symbol).join(",");
        const from = getFromDate(range);
        const to = new Date().toISOString().split("T")[0];

        const res = await fetch(
          `/api/yahoofinance/history?symbols=${symbols}&from=${from}&to=${to}`,
        );
        const data = await res.json();

        // 3. 建 priceMap：key = "AAPL-2024-01-01"
        const priceMap = new Map<
          string,
          { open: number; high: number; low: number; close: number }
        >();

        (
          data.results as {
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

        // 4. 收集所有日期并排序
        const allDates = [
          ...new Set(
            (data.results as { candles: { date: string }[] }[]).flatMap((r) =>
              r.candles.map((c) => c.date),
            ),
          ),
        ].sort();

        // 5. 按日期聚合持仓 OHLC
        const holdingMap = new Map<
          string,
          { quantity: number; cost: number }
        >();
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
            // 按日期排序，确保按时间顺序处理
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

        const points: OHLCPoint[] = allDates.map((date, index) => {
          tradableAssets.forEach((asset) => {
            const txToProcess = (txByAsset.get(asset.id) ?? []).filter((tx) => {
              if (index === 0) return tx.traded_at === date;
              // 处理落在两个交易日之间的交易（周末/节假日）
              return tx.traded_at > allDates[index - 1] && tx.traded_at <= date;
            });

            txToProcess
              .sort((a, b) => a.traded_at.localeCompare(b.traded_at))
              .forEach((tx) => {
                const cur = holdingMap.get(asset.id) ?? {
                  quantity: 0,
                  cost: 0,
                };
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

        console.log("points", points);
        setChartData(points);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchAndCompute();
  }, [range, assets, allTransactions]);

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
      height: 300,
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
      },
      rightPriceScale: {
        borderColor: "rgba(0,0,0,0.1)",
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
      seriesRef.current = series;
    } else {
      // 收益率面积图
      const totalCost = assets.reduce((sum, a) => sum + a.total_cost, 0);

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
  }, [chartData, view, assets]);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Portfolio Value</CardTitle>
            <CardDescription>
              {view === "usd" ? "Total asset value (USD)" : "Return rate (%)"}
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            {/* USD / % 切换 */}
            <div className="flex rounded-md border overflow-hidden">
              <Button
                variant={view === "usd" ? "default" : "ghost"}
                size="sm"
                className="rounded-none text-xs px-3"
                onClick={() => setView("usd")}
              >
                USD
              </Button>
              <Button
                variant={view === "pct" ? "default" : "ghost"}
                size="sm"
                className="rounded-none text-xs px-3"
                onClick={() => setView("pct")}
              >
                %
              </Button>
            </div>

            {/* 时间范围切换 */}
            <div className="flex gap-1">
              {RANGES.map((r) => (
                <Button
                  key={r}
                  variant={range === r ? "default" : "ghost"}
                  size="sm"
                  className="text-xs px-2"
                  onClick={() => setRange(r)}
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-75 text-muted-foreground text-sm">
            Loading...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-75 text-muted-foreground text-sm">
            No data
          </div>
        ) : (
          <div ref={chartContainerRef} className="w-full" />
        )}
      </CardContent>
    </Card>
  );
}
