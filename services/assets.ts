"use server";

import { createClient } from "../lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Asset } from "@/types/global";
import { assetSchema } from "@/lib/schemas/asset";

//  读取所有资产
export async function getAssets() {
  const supabase = await createClient();

  // 从 session 取得当前登录用户，用于 IDOR 防护
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from("assets")
    .select("*")
    // 只取属于当前用户的数据，防止越权读取
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }); // 最新的排在前面

  if (error) throw new Error(error.message);
  return data as Asset[]; // 返回所有资产
}

// 新增资产
export async function createAsset(rawData: unknown) {
  const supabase = await createClient();

  // Supabase API
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  // 零信任原则：不相信任何外部传入的数据
  // safeParse 验证不通过时不会抛出异常，而是返回 { success: false }
  const result = assetSchema.safeParse(rawData);
  if (!result.success) throw new Error(result.error.message);

  // result.data 是经过 Zod 剥离后 100% 干净的数据
  // 即使原始数据里夹带了 id、user_id 等恶意字段，这里也不会被存入数据库
  const { error } = await supabase.from("assets").insert([
    {
      ...result.data,
      user_id: user.id,
    },
  ]);

  if (error) throw new Error(error.message);
  revalidatePath("/assets");
}

// 删除资产
export async function deleteAsset(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { error } = await supabase
    .from("assets")
    .delete()
    .eq("id", id)
    // 双重过滤：同时验证 id 和 user_id
    // 防止用户通过伪造 id 来修改别人的数据（IDOR 漏洞）
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/assets");
}

// 更新资产
export async function updateAsset(id: string, rawData: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const result = assetSchema.safeParse(rawData);
  if (!result.success) throw new Error(result.error.message);

  const { error } = await supabase
    .from("assets")
    .update(result.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/assets");
}
