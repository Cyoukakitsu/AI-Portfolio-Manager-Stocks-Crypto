"use client";

// PortfolioCandlestickChart コンポーネントのロジック Hook
// 職責：range/view 状態管理、データ取得、OHLC 計算、chart 描画

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  ColorType,
} from "lightweight-charts";
import type { Asset, Transaction } from "@/features/assets/types";
import { computeFromDate, type Range } from "@/features/assets/lib/date-utils";
import { computePortfolioOHLC } from "@/features/assets/lib/portfolio-ohlc";

export const RANGES: Range[] = ["1M", "6M", "1Y", "YTD", "MAX"];

const UP_COLOR = "#22c55e";
const DOWN_COLOR = "#ef4444";
const PRICE_SCALE_OPTIONS = {
  autoScale: true,
  scaleMargins: { top: 0.1, bottom: 0.1 },
};

// 把收盘价换算为相对总成本的涨跌幅（%）；没有成本时记为 0
function toReturnPct(close: number, totalCost: number) {
  if (totalCost <= 0) return 0;
  return parseFloat((((close - totalCost) / totalCost) * 100).toFixed(2));
}

type Params = {
  assets: Asset[];
  allTransactions: Transaction[];
};

export function usePortfolioCandlestickChart({ assets, allTransactions }: Params) {
  const [range, setRange] = useState<Range>("1M");
  const [view, setView] = useState<"usd" | "pct">("usd");

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const cashAssets = useMemo(
    () => assets.filter((a) => a.asset_type === "cash"),
    [assets],
  );
  const tradableAssets = useMemo(
    () => assets.filter((a) => a.asset_type !== "cash"),
    [assets],
  );
  const totalCost = assets.reduce((sum, a) => sum + a.total_cost, 0);
  const symbolsKey = tradableAssets.map((a) => a.symbol).join(",");

  const { data: historyData, isFetching } = useQuery({
    queryKey: ["history", symbolsKey, range],
    queryFn: async () => {
      const from = computeFromDate(range);
      const to = new Date().toISOString().split("T")[0];
      const res = await fetch(
        `/api/yahoofinance/history?symbols=${symbolsKey}&from=${from}&to=${to}`,
      );
      return res.json();
    },
    enabled: tradableAssets.length > 0 && allTransactions.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // useMemo 保持引用稳定：ohlcData 是下面 effect 的依赖，每次渲染都变会导致图表反复重建
  const ohlcData = useMemo(
    () =>
      historyData?.results
        ? computePortfolioOHLC({
            historyResults: historyData.results,
            cashAssets,
            tradableAssets,
            allTransactions,
          })
        : [],
    [historyData, cashAssets, tradableAssets, allTransactions],
  );

  useEffect(() => {
    if (!chartContainerRef.current || ohlcData.length === 0) return;

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
        rightOffset: 5,
        minBarSpacing: 2,
      },
      rightPriceScale: {
        borderColor: "rgba(0,0,0,0.1)",
      },
    });

    if (view === "usd") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: UP_COLOR,
        downColor: DOWN_COLOR,
        borderUpColor: UP_COLOR,
        borderDownColor: DOWN_COLOR,
        wickUpColor: UP_COLOR,
        wickDownColor: DOWN_COLOR,
      });
      series.setData(ohlcData);
      series.priceScale().applyOptions(PRICE_SCALE_OPTIONS);
    } else {
      // 收益率模式
      const returnPctData = ohlcData.map((p) => ({
        time: p.time,
        value: toReturnPct(p.close, totalCost),
      }));

      const series = chart.addSeries(AreaSeries, {
        lineColor: "#6366f1",
        topColor: "rgba(99,102,241,0.3)",
        bottomColor: "rgba(99,102,241,0)",
      });
      series.setData(returnPctData);
      series.priceScale().applyOptions(PRICE_SCALE_OPTIONS);
    }

    chart.timeScale().fitContent();

    // 响应式：监听容器尺寸变化，自动调整图表宽度
    const observer = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    });
    observer.observe(chartContainerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [ohlcData, view, totalCost]);

  return {
    range,
    setRange,
    view,
    setView,
    chartContainerRef,
    isFetching,
    ohlcData,
  };
}
