// 对应 Supabase assets 表的结构
export type Asset = {
  id: string;
  created_at: string;
  symbol: string;
  fullname: string;
  asset_type: string;
};

// 新增/编辑时用的类型
export type AssetFormData = Omit<Asset, "id" | "created_at">;
