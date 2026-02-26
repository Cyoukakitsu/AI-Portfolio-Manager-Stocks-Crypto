"use server";

import type { Transaction } from "@/types/global";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { transactionSchema, updateTransactionSchema } from "@/lib/schemas/transaction";

export async function getTransactions(assetId: string) {
  const supabase = await createClient();

  // 从 session 取得当前登录用户，用于 IDOR 防护
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    // 双重过滤：同时验证 asset_id 和 user_id，防止越权读取他人交易记录（IDOR）
    .eq("asset_id", assetId)
    .eq("user_id", user.id)
    .order("traded_at", { ascending: false }); // 最新交易排在前面

  if (error) throw new Error(error.message);
  return data as Transaction[]; // 返回交易记录
}

// 新增交易记录
export async function createTransaction(rawData: unknown) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  //零信任原则：用 Zod 验证并剥离所有非法字段
  const result = transactionSchema.safeParse(rawData);
  if (!result.success) throw new Error(result.error.message);

  // result.data 是干净数据，user_id 只从服务端 session 取
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

  // 更新时使用 updateTransactionSchema（不含 asset_id，防止交易被换绑到其他资产）
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
    // 同样加上 user_id 过滤，防止越权删除
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/assets");
}
