// 收益率 = (市场价格 - 均价) / 均价 * 100，正值绿色，负值红色；缺价格或均价时显示 —
type Props = { price: number | null | undefined; avgPrice: number | null };

export function ReturnCell({ price, avgPrice }: Props) {
  if (price == null || !avgPrice) return "—";
  const pct = ((price - avgPrice) / avgPrice) * 100;
  return (
    <span className={pct >= 0 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
      {pct >= 0 ? "+" : ""}
      {pct.toFixed(2)}%
    </span>
  );
}
