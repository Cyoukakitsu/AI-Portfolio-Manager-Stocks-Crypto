"use server";

// Server Actions：交易记录的增删改查
//
// 设计上与 assets.ts 保持一致的安全模型：
//   - 所有写操作先 Zod 校验，再由服务端注入 user_id
//   - 所有读/写/删操作同时过滤 user_id，防止 IDOR 越权

import type { Transaction } from "@/types/global";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { transactionSchema, updateTransactionSchema } from "@/lib/schemas/transaction";

// 查询某个资产下当前用户的所有交易记录
export async function getTransactions(assetId: string) {
  const supabase = await createClient();

  // 从服务端 session 取得当前用户，而非信任客户端传参
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    // 双重过滤：防止用户通过伪造 assetId 读取他人交易记录（IDOR）
    .eq("asset_id", assetId)
    .eq("user_id", user.id)
    .order("traded_at", { ascending: false }); // 最新交易排在前面

  if (error) throw new Error(error.message);
  return data as Transaction[];
}

// 新增交易记录
export async function createTransaction(rawData: unknown) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  // 零信任：用 Zod 验证并剥离所有非法字段
  const result = transactionSchema.safeParse(rawData);
  if (!result.success) throw new Error(result.error.message);

  // user_id 只从服务端 session 取，不允许客户端注入
  const { error } = await supabase.from("transactions").insert([
    {
      ...result.data,
      user_id: user.id,
    },
  ]);

  if (error) throw new Error(error.message);
  revalidatePath("/assets");
}

// 更新交易记录
export async function updateTransaction(id: string, rawData: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  // 使用 updateTransactionSchema（去掉了 asset_id），
  // 防止用户通过更新请求将交易迁移到其他资产（改变外键归属）
  const result = updateTransactionSchema.safeParse(rawData);
  if (!result.success) throw new Error(result.error.message);

  const { error } = await supabase
    .from("transactions")
    .update(result.data)
    .eq("id", id)
    // 双重过滤：防止越权修改别人的交易记录
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/assets");
}

// 删除交易记录
export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    // 同样加 user_id 过滤，防止越权删除他人数据
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/assets");
}
