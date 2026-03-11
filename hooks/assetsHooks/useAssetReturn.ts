//total asset return
import { Asset } from "@/types/global";
import { useEffect, useState } from "react";

type UseAssetReturnParams = {
  assets: Asset[];
};
export function useAssetReturn({ assets }: UseAssetReturnParams) {
  const [currentPrices, setCurrentPrices] = useState<
    Record<string, number | null>
  >({});

  // 当 assets 发生变化时重新拉取所有资产的当前价格
  useEffect(() => {
    async function fetchAllPrices() {
      const entries = await Promise.all(
        assets.map(async (asset) => {
          try {
            const res = await fetch(
              `/api/finnhub/quote?symbol=${asset.symbol}`,
            );
            const data = await res.json();
            return [asset.symbol, data.price] as [string, number | null];
          } catch {
            return [asset.symbol, null] as [string, null];
          }
        }),
      );
      setCurrentPrices(Object.fromEntries(entries));
    }

    if (assets.length > 0) fetchAllPrices();
  }, [assets]);

  // 计算总市值
  const totalValue = assets.reduce((acc, asset) => {
    const price = currentPrices[asset.symbol];
    if (price !== null && price > 0) {
      return acc + price * asset.total_quantity;
    }
    return acc;
  }, 0);

  // 计算总投入成本
  const totalCost = assets.reduce((acc, asset) => acc + asset.total_cost, 0);

  // 收益金额 & 收益率
  const totalReturn = totalValue - totalCost;
  const totalReturnPct = totalCost > 0 ? (totalReturn / totalCost) * 100 : null;

  return {
    totalValue,
    totalCost,
    totalReturn,
    totalReturnPct,
  };
}
