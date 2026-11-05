"use client";

// PortfolioCandlestickChart コンポーネントのロジック Hook
// 職責：range/view 状態管理、データ取得、OHLC 計算、chart 描画

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useColorTheme } from "@/hooks/use-color-theme";
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

// 图表颜色在运行时读设计令牌（lightweight-charts 不认 var()），主题变化时重建图表
// 借一个临时元素让浏览器把令牌解析成 rgb()/rgba()，避免自己解析 hex 与 rgb(0 0 0 / .06) 两种写法
function readToken(name: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

const PRICE_SCALE_OPTIONS = {
  autoScale: true,
  scaleMargins: { top: 0.1, bottom: 0.1 },
};

// 把收盘价换算为相对总成本的涨跌幅（%）；没有成本时记为 0
function toReturnPct(close: number, totalCost: number) {
  if (totalCost <= 0) return 0;
  return parseFloat((((close - totalCost) / totalCost) * 100).toFixed(2));
}

type ChartParams = {
  view: "usd" | "pct";
  ohlcData: ReturnType<typeof computePortfolioOHLC>;
  totalCost: number;
};

// 在容器里建图并返回清理函数；颜色每次都从当前主题的令牌读取
function buildChart(
  container: HTMLDivElement,
  { view, ohlcData, totalCost }: ChartParams,
) {
  const upColor = readToken("--up");
  const downColor = readToken("--down");
  const textColor = readToken("--faint");
  const gridColor = readToken("--grid");
  const lineColor = readToken("--border");
  const returnLineColor = readToken("--foreground");

  const chart = createChart(container, {
    width: container.clientWidth,
    height: 350,
    layout: {
      background: { type: ColorType.Solid, color: "transparent" },
      textColor,
    },
    grid: {
      vertLines: { color: gridColor },
      horzLines: { color: gridColor },
    },
    timeScale: {
      borderColor: lineColor,
      rightOffset: 5,
      minBarSpacing: 2,
    },
    rightPriceScale: {
      borderColor: lineColor,
    },
  });

  if (view === "usd") {
    const series = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderUpColor: upColor,
      borderDownColor: downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
    });
    series.setData(ohlcData);
    series.priceScale().applyOptions(PRICE_SCALE_OPTIONS);
  } else {
    // 收益率模式：曲线不表达涨跌，用中性的前景色，面积填充用淡淡的网格色
    const returnPctData = ohlcData.map((p) => ({
      time: p.time,
      value: toReturnPct(p.close, totalCost),
    }));
    const series = chart.addSeries(AreaSeries, {
      lineColor: returnLineColor,
      topColor: gridColor,
      bottomColor: "rgba(0, 0, 0, 0)",
    });
    series.setData(returnPctData);
    series.priceScale().applyOptions(PRICE_SCALE_OPTIONS);
  }

  chart.timeScale().fitContent();

  // 响应式：监听容器尺寸变化，自动调整图表宽度
  const observer = new ResizeObserver(() => {
    chart.applyOptions({ width: container.clientWidth });
  });
  observer.observe(container);

  return () => {
    observer.disconnect();
    chart.remove();
  };
}

type Params = {
  assets: Asset[];
  allTransactions: Transaction[];
};

export function usePortfolioCandlestickChart({
  assets,
  allTransactions,
}: Params) {
  const [range, setRange] = useState<Range>("1M");
  const [view, setView] = useState<"usd" | "pct">("usd");
  const colorTheme = useColorTheme();

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
  // ISO 日期字符串按字典序排序即时间序，MAX 区间从最早一笔交易开始
  const firstTradeDate = allTransactions
    .map((tx) => tx.traded_at.slice(0, 10))
    .sort()[0];
  const from = computeFromDate(range, firstTradeDate);

  const { data: historyData, isFetching } = useQuery({
    queryKey: ["history", symbolsKey, from],
    queryFn: async () => {
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

  // 依赖里的 colorTheme 只用来在切换主题时重建图表（颜色在 buildChart 里读）
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    // 推迟到下一帧再建图：next-themes 在父组件里切 .dark 类，子组件的 effect 先跑，
    // 立刻读令牌会拿到旧主题的颜色
    const raf = requestAnimationFrame(() => {
      const container = chartContainerRef.current;
      if (!container || ohlcData.length === 0) return;
      cleanup = buildChart(container, { view, ohlcData, totalCost });
    });

    return () => {
      cancelAnimationFrame(raf);
      cleanup?.();
    };
  }, [ohlcData, view, totalCost, colorTheme]);

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
