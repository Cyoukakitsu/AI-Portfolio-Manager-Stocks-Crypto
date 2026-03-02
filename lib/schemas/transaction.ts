// 交易记录的 Zod 校验 Schema

import { z } from "zod";

export const transactionSchema = z.object({
  asset_id: z.string(),
  type: z.enum(["buy", "sell"]),
  quantity: z.number().positive("Quantity must be a positive number"),
  price: z.number().positive("Price must be a positive number"),
  // 用正则限定日期格式为 "yyyy-MM-dd"，与数据库 date 字段格式对齐
  traded_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

// updateTransactionSchema 故意去掉 asset_id，
// 防止用户通过更新请求将交易记录"迁移"到其他资产下
export const updateTransactionSchema = transactionSchema.omit({
  asset_id: true,
});

// 类型分别对应新增和更新场景，在表单层面提供精确的类型提示
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type UpdateTransactionFormData = z.infer<typeof updateTransactionSchema>;
