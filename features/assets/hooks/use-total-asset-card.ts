//这个hooks用于计算总资产、今日资产、总资产收益率、今日资产收益率
//它接收一个资产数组作为参数，返回一个对象，包含总资产、今日资产、总资产收益率、今日资产收益率的属性
import { useQuotes } from "@/features/assets/hooks/use-quotes";
import { Asset } from "@/features/assets/types";

type UseAssetReturnParams = {
  assets: Asset[];
};

export function useAssetReturn({ assets }: UseAssetReturnParams) {
  const quotes = useQuotes(assets);

  // 总市值
  const totalValue = assets.reduce((acc, asset) => {
    if (asset.asset_type === "cash") return acc + asset.total_cost;
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

  // 前一日资产市值（现金价值不变，前日 = 当日 total_cost）
  const yesterdayValue = assets.reduce((acc, asset) => {
    if (asset.asset_type === "cash") return acc + asset.total_cost;
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
