"use server";

import type { Transaction } from "@/types/global";
import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";

export async function getTransactions(assetId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("asset_id", assetId)
    .order("traded_at", { ascending: false }); // 最新交易排在前面

  if (error) throw new Error(error.message);
  return data as Transaction[]; // 返回交易记录
}

// 新增交易记录
export async function createTransaction(
  formData: Pick<
    Transaction,
    "asset_id" | "type" | "quantity" | "price" | "traded_at"
  >,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { error } = await supabase.from("transactions").insert([
    {
      ...formData,
      user_id: user.id,
    },
  ]);

  if (error) throw new Error(error.message);
  revalidatePath("/assets");
}

// 更新交易记录
export async function updateTransaction(
  id: string,
  formData: Pick<Transaction, "type" | "quantity" | "price" | "traded_at">,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .update(formData)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/assets");
}

// 删除交易记录
export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/assets");
}
