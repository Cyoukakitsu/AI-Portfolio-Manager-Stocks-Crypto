import { z } from "zod";

export const transactionSchema = z.object({
  asset_id: z.string(),
  type: z.enum(["buy", "sell"]),
  quantity: z.number().positive("Quantity must be a positive number"),
  price: z.number().positive("Price must be a positive number"),
  traded_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export const updateTransactionSchema = transactionSchema.omit({
  asset_id: true,
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type UpdataTransaction = z.infer<typeof updateTransactionSchema>;
