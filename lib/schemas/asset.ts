// 资产表单的 Zod 校验 Schema
// 同时作为 Server Action 的输入白名单：只有 schema 中定义的字段才会被存入数据库

import { z } from "zod";

export const assetSchema = z.object({
  symbol: z.string().min(1, "Please enter a correct symbol"),
  fullname: z.string().min(1, "Please enter a correct name"),
  // z.enum 将合法值限定为固定集合，任何不在列表中的值都会被 Zod 拒绝
  asset_type: z.enum(["stock", "crypto", "etf", "cash"], {
    error: "Please select a valid asset type (stock, crypto, etf, or cash)",
  }),
});

// z.infer 自动推导类型，避免 Schema 和类型声明分开维护导致的漂移
export type AssetFormData = z.infer<typeof assetSchema>;
