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

  // 参考：https://supabase.com/docs/reference/javascript/auth-getuser
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

    //从所有交易记录中分离出买入和卖出两组
    //买入组
    const buyTransactions = transactions.filter(
      (tx: { type: string }) => tx.type === "buy",
    );
    //卖出组
    const sellTransactions = transactions.filter(
      (tx: { type: string }) => tx.type === "sell",
    );

    // 买入总花费 = 每笔买入的（单价 × 数量）累加
    const totalBuyCost = buyTransactions.reduce(
      (sum: number, tx: { price: number; quantity: number }) =>
        sum + tx.price * tx.quantity,
      0,
    );
    //买入总数量 = 所有买入笔数的股数累加
    const totalBuyQty = buyTransactions.reduce(
      (sum: number, tx: { quantity: number }) => sum + tx.quantity,
      0,
    );
    //卖出总金额 = 每笔卖出的（单价 × 数量）累加
    const totalSellCost = sellTransactions.reduce(
      (sum: number, tx: { price: number; quantity: number }) =>
        sum + tx.price * tx.quantity,
      0,
    );
    // 卖出总数量 = 所有卖出笔数的股数累加
    const totalSellQty = sellTransactions.reduce(
      (sum: number, tx: { quantity: number }) => sum + tx.quantity,
      0,
    );

    // 净持仓数量 = 买入总量 - 卖出总量（当前手上还剩几股）
    const netQty = totalBuyQty - totalSellQty;

    // 净成本 = 买入总花费 - 卖出总回收（当前仍押注在该资产上的资金）
    const netCost = totalBuyCost - totalSellCost;

    // 持仓均价 = 净成本 / 净持仓数量
    // netQty <= 0 代表已全部卖出，返回 null 而非 NaN
    const avg_price = netQty > 0 ? netCost / netQty : null;

    // total_cost 与 netCost 相同，单独赋值是为了与 Asset 类型字段名保持一致
    const total_cost = netCost;

    // total_quantity：当前净持仓数量，供前端直接显示
    const total_quantity = netQty;

    return {
      id: asset.id,
      user_id: asset.user_id,
      symbol: asset.symbol,
      fullname: asset.fullname,
      asset_type: asset.asset_type,
      created_at: asset.created_at,
      avg_price,
      total_cost,
      total_quantity,
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
      throw new Error("Asset with the same symbol already exists");
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
