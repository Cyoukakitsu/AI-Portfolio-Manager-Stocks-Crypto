/**
 * 全局共享类型定义
 *
 * 这里的类型与 Supabase 数据库表结构一一对应。
 * 集中在一个文件管理，可以避免各模块各自定义导致的类型不一致问题。
 */

// 对应 Supabase `assets` 表
// 注意：avg_price 和 total_cost 并非数据库原始字段，
// 而是在 getAssets() 中通过聚合关联的 transactions 实时计算出来的派生值。
export type Asset = {
  id: string;
  user_id: string;
  symbol: string; // 交易代码，如 "AAPL"、"BTC-USD"
  fullname: string; // 完整名称，如 "Apple Inc."
  asset_type: "stock" | "crypto" | "etf" | "cash";
  created_at: string;
  avg_price: number | null; // 加权平均买入价；若从未买入则为 null
  total_cost: number; // 当前持仓总成本（买入总额 - 卖出总额）
  total_quantity: number; // 当前持仓总数量（买入总量 - 卖出总量）
};

// 对应 Supabase `transactions` 表
// type 使用联合类型而非 string，可在编译期防止写错值（如 "Buy" 或 "BUY"）
// user_id 冗余存储（本可从 asset 推断），但为了能在 RLS 层直接过滤而保留
export type Transaction = {
  id: string;
  asset_id: string; // 外键，关联 assets.id
  user_id: string; // 冗余字段，用于行级安全（Row Level Security）直接过滤
  type: "buy" | "sell";
  quantity: number;
  price: number;
  traded_at: string; // 实际交易日期，格式 "yyyy-MM-dd"（区别于入库时间）
  created_at: string; // 记录创建时间，由数据库自动写入
};
