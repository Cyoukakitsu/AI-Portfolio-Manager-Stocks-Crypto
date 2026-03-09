"use client";

// 累计收益面积图
// 面积图（Area Chart）相比折线图，能更直观地表现资产增长趋势。

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Asset, Transaction } from "@/types/global";

// chartConfig 用于驱动 shadcn/ui 的 ChartContainer 自动注入 CSS 变量（--color-profit）
const chartConfig = {
  returnRate: { label: "Return", color: "var(--chart-1)" },
} satisfies ChartConfig;

type Props = {
  assets: Asset[];
  allTransactions: Transaction[];
};

// 图表数据点
type ChartDataPoint = {
  date: string;
  returnRate: number; // 收益率，单位 %
};

// 时间范围选项
const RANGES = ["1D", "5D", "1M", "6M", "YTD", "1Y"] as const;
type Range = (typeof RANGES)[number];

export function ProfitAreaChart({ assets, allTransactions }: Props) {
  const [range, setRange] = useState<Range>("1M");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 没有资产或交易记录时不发请求
    if (assets.length === 0 || allTransactions.length === 0) return;

    async function fetchAndCompute() {
      setLoading(true);
      try {
        // 只拉取 stock / etf 类型的资产（Finnhub candle 不支持 crypto 和 cash）
        const tradableAssets = assets.filter(
          (a) => a.asset_type === "stock" || a.asset_type === "etf",
        );
        if (tradableAssets.length === 0) return;

        // 并行拉取所有资产的历史K线（单个失败时跳过，不影响其他）
        const candleResults = (
          await Promise.all(
            tradableAssets.map(async (asset) => {
              try {
                const res = await fetch(
                  `/api/fmp/candles?symbol=${asset.symbol}&range=${range}`,
                );
                const data = await res.json();
                if (data.error) return null; // 跳过不支持的 symbol
                return {
                  symbol: asset.symbol,
                  candles: (data.candles ?? []) as { date: string; close: number }[],
                };
              } catch {
                return null;
              }
            }),
          )
        ).filter((r) => r !== null);

        // 收集所有出现过的日期，并排序
        const allDates = [
          ...new Set(
            candleResults.flatMap((r) => r.candles.map((c) => c.date)),
          ),
        ].sort();

        // 将 K线数据转成 Map，方便按 symbol + date 快速查找
        // key: "AAPL-2024-01-01", value: 收盘价
        const priceMap = new Map<string, number>();
        candleResults.forEach(({ symbol, candles }) => {
          candles.forEach(({ date, close }) => {
            priceMap.set(`${symbol}-${date}`, close);
          });
        });

        // 将交易记录按 assetId 分组，方便后续按日期查找
        const txByAsset = new Map<string, Transaction[]>();
        allTransactions.forEach((tx) => {
          const list = txByAsset.get(tx.asset_id) ?? [];
          list.push(tx);
          txByAsset.set(tx.asset_id, list);
        });

        // 按日期逐天计算持仓状态和收益率
        // holdingMap: assetId → { quantity, cost }
        const holdingMap = new Map<
          string,
          { quantity: number; cost: number }
        >();

        const result: ChartDataPoint[] = allDates.map((date) => {
          // 当天有交易的话，先更新持仓和成本
          tradableAssets.forEach((asset) => {
            const txList = txByAsset.get(asset.id) ?? [];
            // 只处理当天的交易
            const todayTx = txList.filter((tx) => tx.traded_at === date);

            todayTx.forEach((tx) => {
              const current = holdingMap.get(asset.id) ?? {
                quantity: 0,
                cost: 0,
              };
              if (tx.type === "buy") {
                holdingMap.set(asset.id, {
                  quantity: current.quantity + tx.quantity,
                  // 买入时累加成本
                  cost: current.cost + tx.price * tx.quantity,
                });
              } else {
                // 卖出时按比例减少成本
                const sellRatio = tx.quantity / current.quantity;
                holdingMap.set(asset.id, {
                  quantity: current.quantity - tx.quantity,
                  cost: current.cost * (1 - sellRatio),
                });
              }
            });
          });

          // 计算当天总市值和累计成本
          let totalValue = 0;
          let totalCost = 0;

          tradableAssets.forEach((asset) => {
            const holding = holdingMap.get(asset.id);
            if (!holding || holding.quantity === 0) return;

            const price = priceMap.get(`${asset.symbol}-${date}`);
            if (price == null) return;

            totalValue += holding.quantity * price;
            totalCost += holding.cost;
          });

          // 成本为 0 时收益率为 0，避免除以零
          const returnRate =
            totalCost > 0
              ? parseFloat(
                  (((totalValue - totalCost) / totalCost) * 100).toFixed(2),
                )
              : 0;

          return { date, returnRate };
        });

        setChartData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchAndCompute();
  }, [range, assets, allTransactions]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profit Return</CardTitle>
            <CardDescription>Return rate over time (%)</CardDescription>
          </div>
          {/* 时间范围切换按钮 */}
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
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-12.5 text-muted-foreground text-sm">
            Loading...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-12.5 text-muted-foreground text-sm">
            No data
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                // 只显示部分日期，避免 X 轴过于拥挤
                interval="preserveStartEnd"
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                // tickFormatter 将数值格式化为带美元符号的字符串
                tickFormatter={(v) => `${v}%`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`${value}%`, "Return"]}
                  />
                }
              />
              <Area
                type="monotone" // 平滑曲线（而非折线）
                dataKey="returnRate"
                stroke="var(--color-returnRate)"
                fill="var(--color-returnRate)"
                fillOpacity={0.2} // 半透明填充，让面积图视觉上不太厚重
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
