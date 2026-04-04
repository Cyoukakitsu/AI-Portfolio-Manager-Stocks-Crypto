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
  const [prevClosePrices, setPrevClosePrices] = useState<
    Record<string, number | null>
  >({});

  useEffect(() => {
    async function fetchAllPrices() {
      console.log(
        `[useAssetReturn] Fetching prices for:`,
        assets.map((a) => a.symbol),
      );
      const entries = await Promise.all(
        assets.map(async (asset) => {
          try {
            const res = await fetch(
              `/api/yahoofinance/quote?symbol=${encodeURIComponent(asset.symbol)}`,
            );
            if (!res.ok) {
              const errorData = await res.json();
              console.error(`[Hook] API error for ${asset.symbol}:`, errorData);
              return [asset.symbol, null, null] as [string, null, null];
            }
            const data = await res.json();
            console.log(
              `[Hook] Received price for ${asset.symbol}:`,
              data.price,
            );
            return [
              asset.symbol,
              data.price ?? null,
              data.prevClose ?? null,
            ] as [string, number | null, number | null];
          } catch (err) {
            console.error(`[Hook] Fetch error for ${asset.symbol}:`, err);
            return [asset.symbol, null, null] as [string, null, null];
          }
        }),
      );
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

  const yesterdayValue = assets.reduce((acc, asset) => {
    const prev = prevClosePrices[asset.symbol];
    if (prev != null && prev > 0) return acc + prev * asset.total_quantity;
    return acc;
  }, 0);

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
