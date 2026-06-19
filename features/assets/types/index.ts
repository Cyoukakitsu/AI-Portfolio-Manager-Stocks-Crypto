// 对应 Supabase `assets` 表
// avg_price、total_cost、total_quantity 是 getAssets() 通过聚合 transactions 计算出的派生值
export type Asset = {
  id: string;
  user_id: string;
  symbol: string;
  fullname: string;
  asset_type: "stock" | "crypto" | "etf" | "cash";
  created_at: string;
  avg_price: number | null;
  total_cost: number;
  total_quantity: number;
};

// 对应 Supabase `transactions` 表
export type Transaction = {
  id: string;
  asset_id: string;
  user_id: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  traded_at: string;
  created_at: string;
};

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedDate: string;
  content: string;
}

export interface SymbolNews {
  symbol: string;
  articles: NewsArticle[];
}
