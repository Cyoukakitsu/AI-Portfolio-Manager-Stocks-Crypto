// 组合 OHLC 计算
// 将原始 OHLCV 历史数据 + 持仓变化记录 → 每日组合净值的 OHLC 数据点

import type { Asset, Transaction } from "@/types/global";

export type OHLCPoint = {
  time: string; // "YYYY-MM-DD"
  open: number;
  high: number;
  low: number;
  close: number;
};

type Candle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type HistoryResult = {
  symbol: string;
  candles: Candle[];
};

type Params = {
  historyResults: HistoryResult[];
  cashAssets: Asset[];
  tradableAssets: Asset[];
  allTransactions: Transaction[];
};

export function computePortfolioOHLC({
  historyResults,
  cashAssets,
  tradableAssets,
  allTransactions,
}: Params): OHLCPoint[] {
  // 现金部分的总价值（固定，不随日期变化）
  const cashValue = cashAssets.reduce((sum, a) => sum + a.total_cost, 0);

  // 构建价格查询表：key = "SYMBOL-YYYY-MM-DD"
  const priceMap = new Map<string, { open: number; high: number; low: number; close: number }>();
  historyResults.forEach(({ symbol, candles }) => {
    candles.forEach((c) => {
      priceMap.set(`${symbol}-${c.date}`, {
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      });
    });
  });

  // 收集所有交易日并升序排列
  const allDates = [
    ...new Set(historyResults.flatMap((r) => r.candles.map((c) => c.date))),
  ].sort();

  // 持仓快照：记录每个资产当前的持仓数量和成本
  const holdingMap = new Map<string, { quantity: number; cost: number }>();
  // 按资产 ID 分组的交易记录
  const txByAsset = new Map<string, Transaction[]>();
  allTransactions.forEach((tx) => {
    const list = txByAsset.get(tx.asset_id) ?? [];
    list.push(tx);
    txByAsset.set(tx.asset_id, list);
  });

  // 预填充：处理图表日期范围开始之前已发生的所有交易
  if (allDates.length > 0) {
    tradableAssets.forEach((asset) => {
      const preDateTx = (txByAsset.get(asset.id) ?? []).filter(
        (tx) => tx.traded_at < allDates[0],
      );
      preDateTx.sort((a, b) => a.traded_at.localeCompare(b.traded_at));
      preDateTx.forEach((tx) => {
        const cur = holdingMap.get(asset.id) ?? { quantity: 0, cost: 0 };
        if (tx.type === "buy") {
          holdingMap.set(asset.id, {
            quantity: cur.quantity + tx.quantity,
            cost: cur.cost + tx.price * tx.quantity,
          });
        } else {
          // 卖出时按比例减少成本
          const ratio = tx.quantity / cur.quantity;
          holdingMap.set(asset.id, {
            quantity: cur.quantity - tx.quantity,
            cost: cur.cost * (1 - ratio),
          });
        }
      });
    });
  }

  // 逐日计算组合 OHLC
  return allDates.map((date, index) => {
    // 先处理当日（含跨越周末/节假日）发生的交易，更新持仓快照
    tradableAssets.forEach((asset) => {
      const txToProcess = (txByAsset.get(asset.id) ?? []).filter((tx) => {
        if (index === 0) return tx.traded_at === date;
        // 处理落在两个交易日之间的交易（周末/节假日成交日补录）
        return tx.traded_at > allDates[index - 1] && tx.traded_at <= date;
      });

      txToProcess
        .sort((a, b) => a.traded_at.localeCompare(b.traded_at))
        .forEach((tx) => {
          const cur = holdingMap.get(asset.id) ?? { quantity: 0, cost: 0 };
          if (tx.type === "buy") {
            holdingMap.set(asset.id, {
              quantity: cur.quantity + tx.quantity,
              cost: cur.cost + tx.price * tx.quantity,
            });
          } else {
            const ratio = tx.quantity / cur.quantity;
            holdingMap.set(asset.id, {
              quantity: cur.quantity - tx.quantity,
              cost: cur.cost * (1 - ratio),
            });
          }
        });
    });

    // 当日组合 OHLC = Σ(持仓数量 × 当日价格) + 现金
    let open = cashValue, high = cashValue, low = cashValue, close = cashValue;

    tradableAssets.forEach((asset) => {
      const holding = holdingMap.get(asset.id);
      if (!holding || holding.quantity === 0) return;
      const price = priceMap.get(`${asset.symbol}-${date}`);
      if (!price) return;

      open += holding.quantity * price.open;
      high += holding.quantity * price.high;
      low += holding.quantity * price.low;
      close += holding.quantity * price.close;
    });

    return { time: date, open, high, low, close };
  });
}
