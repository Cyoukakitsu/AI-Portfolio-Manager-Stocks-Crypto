/**
 * 资产持仓计算工具函数
 *
 * 职责：根据资产的交易记录（买入/卖出），计算当前持仓的净数量、净成本和持仓成本价。
 * 遵循单一事实来源原则：所有持仓数据都由原始交易流水实时聚合得出。
 */

type TransactionLike = {
  price: number;
  quantity: number;
  type: string;
};

function sumOf(transactions: TransactionLike[]) {
  return {
    quantity: transactions.reduce((sum, tx) => sum + tx.quantity, 0),
    amount: transactions.reduce((sum, tx) => sum + tx.price * tx.quantity, 0),
  };
}

export function calculateAssetHoldings(transactions: TransactionLike[]) {
  const bought = sumOf(transactions.filter((tx) => tx.type === "buy"));
  const sold = sumOf(transactions.filter((tx) => tx.type === "sell"));

  const netQty = bought.quantity - sold.quantity;
  const netCost = bought.amount - sold.amount;

  // 持仓成本价 = (买入总额 - 卖出回收额) / 剩余数量，卖出价会影响它。
  // 持仓数量 <= 0 时没有成本价，返回 null
  return {
    total_quantity: netQty,
    total_cost: netCost,
    avg_price: netQty > 0 ? netCost / netQty : null,
  };
}
