//这个hooks用于计算总资产、今日资产、总资产收益率、今日资产收益率
//它接收一个资产数组作为参数，返回一个对象，包含总资产、今日资产、总资产收益率、今日资产收益率的属性
import { Asset } from "@/types/global";
import { useEffect, useState } from "react";

type UseAssetReturnParams = {
  assets: Asset[];
};
export function useAssetReturn({ assets }: UseAssetReturnParams) {
  // 当前资产价格
  const [currentPrices, setCurrentPrices] = useState<
    Record<string, number | null>
  >({});

  // 前一日资产价格
  const [prevClosePrices, setPrevClosePrices] = useState<
    Record<string, number | null>
  >({});

  useEffect(() => {
    // 从服务器获取资产价格
    async function fetchAllPrices() {
      const entries = await Promise.all(
        assets.map(async (asset) => {
          try {
            const res = await fetch(
              `/api/yahoofinance/quote?symbol=${asset.symbol}`,
            );
            const data = await res.json();
            return [asset.symbol, data.price, data.prevClose] as [
              string,
              number | null,
              number | null,
            ];
          } catch {
            return [asset.symbol, null, null] as [string, null, null];
          }
        }),
      );
      // 将获取到的价格转换为对象，键为资产符号，值为价格
      setCurrentPrices(Object.fromEntries(entries.map(([s, p]) => [s, p])));
      setPrevClosePrices(
        Object.fromEntries(entries.map(([s, , pc]) => [s, pc])),
      );
    }

    if (assets.length > 0) fetchAllPrices();
  }, [assets]);

  // 总市值
  const totalValue = assets.reduce((acc, asset) => {
    const price = currentPrices[asset.symbol];
    if (price !== null && price !== undefined && price > 0) {
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
    const price = currentPrices[asset.symbol];
    const prev = prevClosePrices[asset.symbol];
    if (price != null && prev != null && price > 0 && prev > 0) {
      return acc + (price - prev) * asset.total_quantity;
    }
    return acc;
  }, 0);

  // 前一日资产市值
  const yesterdayValue = assets.reduce((acc, asset) => {
    const prev = prevClosePrices[asset.symbol];
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
