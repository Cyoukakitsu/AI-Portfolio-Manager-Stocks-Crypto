// 资产表单的 Zod 校验 Schema
// 只允许这三个字段通过验证，其他字段由数据库或服务端自动生成，不应该让前端传入

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
