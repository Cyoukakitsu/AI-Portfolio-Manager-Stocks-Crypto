// 对应 Supabase assets 表的结构
export type Asset = {
  id: string;
  user_id: string;
  symbol: string;
  fullname: string;
  asset_type: string;
  created_at: string;
};

// 对应 Supabase transactions 表的结构
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
