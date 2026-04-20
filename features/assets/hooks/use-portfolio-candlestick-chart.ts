"use client";

// PortfolioCandlestickChart コンポーネントのロジック Hook
// 職責：range/view 状態管理、データ取得、OHLC 計算、chart 描画

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
import type { Asset, Transaction } from "@/types/global";
import { getFromDate, type Range } from "@/features/assets/lib/date-utils";
import { computePortfolioOHLC } from "@/features/assets/lib/portfolio-ohlc";

export const RANGES: Range[] = ["1M", "6M", "1Y", "YTD", "MAX"];

type Params = {
  assets: Asset[];
  allTransactions: Transaction[];
};

export function usePortfolioCandlestickChart({ assets, allTransactions }: Params) {
  const [range, setRange] = useState<Range>("1M");
  const [view, setView] = useState<"usd" | "pct">("usd");

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Area"> | null>(null);

  const cashAssets = assets.filter((a) => a.asset_type === "cash");
  const tradableAssets = assets.filter((a) => a.asset_type !== "cash");
  const totalCost = assets.reduce((sum, a) => sum + a.total_cost, 0);
  const symbolsKey = tradableAssets.map((a) => a.symbol).join(",");

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

  // 调用 lib 中的纯函数计算每日组合 OHLC
  const chartData = historyData?.results
    ? computePortfolioOHLC({
        historyResults: historyData.results,
        cashAssets,
        tradableAssets,
        allTransactions,
      })
    : [];

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    // 每次重建前先销毁旧实例，防止内存泄漏
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

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

    chartRef.current = chart;

    if (view === "usd") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });
      series.setData(chartData);
      series.priceScale().applyOptions({
        autoScale: true,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      });
      seriesRef.current = series;
    } else {
      // 收益率模式：将每日收盘价换算为相对总成本的涨跌幅（%）
      const areaData = chartData.map((p) => ({
        time: p.time,
        value: totalCost > 0
          ? parseFloat((((p.close - totalCost) / totalCost) * 100).toFixed(2))
          : 0,
      }));

      const series = chart.addSeries(AreaSeries, {
        lineColor: "#6366f1",
        topColor: "rgba(99,102,241,0.3)",
        bottomColor: "rgba(99,102,241,0)",
      });
      series.setData(areaData);
      series.priceScale().applyOptions({
        autoScale: true,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      });
      seriesRef.current = series;
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
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [chartData, view, totalCost]);

  return {
    range,
    setRange,
    view,
    setView,
    chartContainerRef,
    isFetching,
    chartData,
  };
}
