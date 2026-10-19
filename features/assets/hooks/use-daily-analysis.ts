// DailyAnalysis コンポーネントのロジック Hook
// 職責：symbol リスト生成、ニュースデータ取得、派生状態の計算

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Asset } from "@/features/assets/types";
import type { SymbolNews } from "@/features/assets/types";

type Params = { assets: Asset[] };

export function useDailyAnalysis({ assets }: Params) {
  const symbols = assets.map((a) => a.symbol);
  const forceRef = useRef(false);

  const { data, isFetching, dataUpdatedAt, refetch } = useQuery<SymbolNews[]>({
    queryKey: ["news", symbols],
    queryFn: async () => {
      const force = forceRef.current;
      forceRef.current = false; // 使用後にリセット
      const url = `/api/assets/news?symbols=${encodeURIComponent(symbols.join(","))}${force ? "&force=true" : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      return json.results ?? [];
    },
    enabled: symbols.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const forceRefetch = () => {
    forceRef.current = true;
    refetch();
  };

  const results = data ?? [];
  // 判断是否有至少一条可显示的新闻
  const hasNews = results.some((r) => r.articles.length > 0);
  // 上次成功更新的时间戳
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return { symbols, results, isFetching, hasNews, lastUpdated, forceRefetch };
}
