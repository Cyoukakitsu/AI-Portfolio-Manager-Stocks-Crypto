/**
 * 资产持仓计算工具函数
 *
 * 职责：根据资产的交易记录（买入/卖出），计算当前持仓的净数量、总成本和平均买入价。
 * 遵循单一事实来源原则：所有持仓数据都由原始交易流水实时聚合得出。
 */

type TransactionLike = {
  price: number;
  quantity: number;
  type: string;
};

export function calculateAssetHoldings(transactions: TransactionLike[]) {
  // 1. 分离买入和卖出交易
  const buyTransactions = transactions.filter((tx) => tx.type === "buy");
  const sellTransactions = transactions.filter((tx) => tx.type === "sell");

  // 2. 计算买入总量和总金额
  const totalBuyCost = buyTransactions.reduce(
    (sum, tx) => sum + tx.price * tx.quantity,
    0,
  );
  const totalBuyQty = buyTransactions.reduce((sum, tx) => sum + tx.quantity, 0);

  // 3. 计算卖出总量和总金额
  const totalSellCost = sellTransactions.reduce(
    (sum, tx) => sum + tx.price * tx.quantity,
    0,
  );
  const totalSellQty = sellTransactions.reduce(
    (sum, tx) => sum + tx.quantity,
    0,
  );

  // 4. 计算净值
  const netQty = totalBuyQty - totalSellQty;
  const netCost = totalBuyCost - totalSellCost;

  // 5. 计算持仓均价：(买入总成本 - 卖出回收总成本) / 剩余持仓数量
  // 若持仓数量 <= 0，则均价为 null
  const avg_price = netQty > 0 ? netCost / netQty : null;

  return {
    total_quantity: netQty,
    total_cost: netCost,
    avg_price,
  };
}
