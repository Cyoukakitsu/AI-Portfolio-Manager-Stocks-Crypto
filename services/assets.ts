"use server";

// Server Actions：资产的增删改查
//
// 所有函数都遵循两个安全原则：
//   1. 零信任：外部传入数据必须经过 Zod 校验后才能使用
//   2. IDOR 防护：所有 DB 操作都同时过滤 user_id，防止越权操作他人数据

import { createClient } from "../lib/supabase/server";
import { revalidatePath } from "next/cache";
import { assetSchema } from "@/lib/schemas/asset";

// 读取当前用户的所有资产（附带实时计算的平均价和持仓成本）
export async function getAssets() {
  const supabase = await createClient();

  // 从服务端 session 取得当前用户，而非从请求参数取，防止伪造
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from("assets")
    .select(
      `
    *,
    transactions (
      price,
      quantity,
      type
    )
  `,
    )
    // 只取属于当前用户的数据，Supabase RLS 之外的额外保障
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }); // 最新资产排在前面

  if (error) throw new Error(error.message);

  // 在服务端聚合交易数据，避免把原始 transactions 数组暴露给前端
  const assetsWithAvgPrice = data.map((asset) => {
    const transactions = asset.transactions as {
      price: number;
      quantity: number;
      type: string;
    }[];

    const buyTx = transactions.filter(
      (tx: { type: string }) => tx.type === "buy",
    );
    const sellTx = transactions.filter(
      (tx: { type: string }) => tx.type === "sell",
    );

    // 加权平均价 = 所有买入订单的总成本 / 总买入数量
    const totalCost = buyTx.reduce(
      (sum: number, tx: { price: number; quantity: number }) =>
        sum + tx.price * tx.quantity,
      0,
    );
    const totalQty = buyTx.reduce(
      (sum: number, tx: { quantity: number }) => sum + tx.quantity,
      0,
    );
    // 边界条件：未买入过时 avg_price 返回 null，而非 NaN（0/0 的结果）
    const avg_price = totalQty > 0 ? totalCost / totalQty : null;

    const totalSellCost = sellTx.reduce(
      (sum, tx) => sum + tx.price * tx.quantity,
      0,
    );

    // 持仓成本 = 买入总花费 - 卖出所得；代表当前仍锁定在该资产中的资金
    const total_cost = totalCost - totalSellCost;

    return {
      id: asset.id,
      user_id: asset.user_id,
      symbol: asset.symbol,
      fullname: asset.fullname,
      asset_type: asset.asset_type,
      created_at: asset.created_at,
      avg_price,
      total_cost,
    };
  });

  return assetsWithAvgPrice;
}

// 新增资产
export async function createAsset(rawData: unknown) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  // 零信任原则：safeParse 不通过时不会抛出异常，而是返回 { success: false }
  const result = assetSchema.safeParse(rawData);
  if (!result.success) throw new Error(result.error.message);

  // result.data 是经过 Zod 剥离后的干净数据：
  // 即使原始数据夹带了 id、user_id 等恶意字段，这里也不会被写入数据库
  const { error } = await supabase.from("assets").insert([
    {
      ...result.data,
      user_id: user.id, // user_id 只从服务端 session 取，不信任客户端传值
    },
  ]);

  if (error) {
    // 23505 是 PostgreSQL 的唯一约束违反错误码，转换为用户友好提示
    if (error.code === "23505")
      throw new Error("该 Symbol 已存在，请使用其他名称");
    throw new Error(error.message);
  }
  // 让 Next.js 重新拉取 /assets 页面的 Server Component 数据
  revalidatePath("/dashboard/assets");
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
    // 双重过滤：同时校验 id 和 user_id，
    // 防止用户通过猜测他人 id 来删除别人的资产（IDOR 漏洞）
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/assets");
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
    .eq("user_id", user.id); // 同样加 user_id 过滤，防止越权修改

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/assets");
}
