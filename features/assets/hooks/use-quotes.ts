// 各资产的实时报价，total-asset-card 与 asset-table 共用同一份缓存
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchQuotes, type QuoteData } from "@/lib/market-api";
import type { Asset } from "@/features/assets/types";

export type QuotesMap = Record<string, QuoteData>;

export function useQuotes(assets: Asset[]) {
  const symbolsKey = assets.map((a) => a.symbol).join(",");

  const { data = {} } = useQuery<QuotesMap>({
    queryKey: ["quotes", symbolsKey],
    // 现金没有行情
    queryFn: () =>
      fetchQuotes(
        assets.filter((a) => a.asset_type !== "cash").map((a) => a.symbol),
      ),
    enabled: assets.length > 0,
    staleTime: 60 * 1000, // 1 分钟内不重复请求
    gcTime: 5 * 60 * 1000, // 内存保留 5 分钟，导航回来直接用
    placeholderData: keepPreviousData, // 重新获取时保持旧数据，避免闪烁为空
  });
  return data;
}
