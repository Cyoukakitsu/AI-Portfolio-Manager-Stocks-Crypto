"use server";

import { AssetFormData } from "@/types/global";
import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";

// "use server" 告诉 Next.js 这个文件里的函数只在服务器端运行

// ✅ 读取所有资产
export async function getAssets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false }); // 最新的排在前面

  if (error) throw new Error(error.message);
  return data;
}

//✅ 新增资产
export async function createAsset(formData: AssetFormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("assets").insert([formData]);
  if (error) throw new Error(error.message);

  revalidatePath("/assets");
}

//✅ 删除资产
export async function deleteAsset(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("assets").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/assets");
}

//✅ 更新资产
export async function updateAsset(id: string, formData: AssetFormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("assets").update(formData).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/assets");
}
