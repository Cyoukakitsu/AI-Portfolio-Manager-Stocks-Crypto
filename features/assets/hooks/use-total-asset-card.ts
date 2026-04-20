//这个hooks用于计算总资产、今日资产、总资产收益率、今日资产收益率
//它接收一个资产数组作为参数，返回一个对象，包含总资产、今日资产、总资产收益率、今日资产收益率的属性
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Asset } from "@/types/global";

type QuoteData = { price: number | null; prevClose: number | null };
type QuotesMap = Record<string, QuoteData>;

type UseAssetReturnParams = {
  assets: Asset[];
};

export function useAssetReturn({ assets }: UseAssetReturnParams) {
  const symbolsKey = assets.map((a) => a.symbol).join(",");

  // 与 use-asset-table 使用相同的 queryKey，两个组件共享同一份缓存，不重复请求
  const { data: quotes = {} } = useQuery<QuotesMap>({
    queryKey: ["quotes", symbolsKey],
    queryFn: async () => {
      const entries = await Promise.all(
        assets.map(async (asset) => {
          try {
            const res = await fetch(
              `/api/yahoofinance/quote?symbol=${asset.symbol}`,
            );
            const data = await res.json();
            return [asset.symbol, { price: data.price ?? null, prevClose: data.prevClose ?? null }];
          } catch {
            return [asset.symbol, { price: null, prevClose: null }];
          }
        }),
      );
      return Object.fromEntries(entries);
    },
    enabled: assets.length > 0,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,       // 数据在内存中保留 5 分钟，导航回来时直接用
    placeholderData: keepPreviousData, // 重新获取时保持旧数据，避免闪烁为空
  });

  // 总市值
  const totalValue = assets.reduce((acc, asset) => {
    const price = quotes[asset.symbol]?.price;
    if (price != null && price > 0) {
      return acc + price * asset.total_quantity;
    }
    return acc;
  }, 0);

  // 总投入成本
  const totalCost = assets.reduce((acc, asset) => acc + asset.total_cost, 0);

  // 总收益
  const totalReturn = totalValue - totalCost;
  const totalReturnPct = totalCost > 0 ? (totalReturn / totalCost) * 100 : null;

  // 今日收益 = sum((currentPrice - prevClose) * quantity)
  const todayReturn = assets.reduce((acc, asset) => {
    const price = quotes[asset.symbol]?.price;
    const prev = quotes[asset.symbol]?.prevClose;
    if (price != null && prev != null && price > 0 && prev > 0) {
      return acc + (price - prev) * asset.total_quantity;
    }
    return acc;
  }, 0);

  // 前一日资产市值
  const yesterdayValue = assets.reduce((acc, asset) => {
    const prev = quotes[asset.symbol]?.prevClose;
    if (prev != null && prev > 0) return acc + prev * asset.total_quantity;
    return acc;
  }, 0);

  // 今日资产收益率：(今日收益 / 昨日资产市值) * 100
  const todayReturnPct =
    yesterdayValue > 0 ? (todayReturn / yesterdayValue) * 100 : null;

  return {
    totalValue,
    totalCost,
    totalReturn,
    totalReturnPct,
    todayReturn,
    todayReturnPct,
  };
}
