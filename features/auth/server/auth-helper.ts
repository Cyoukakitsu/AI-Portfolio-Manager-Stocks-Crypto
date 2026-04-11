"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * 身份验证辅助函数
 * 职责：初始化 Supabase 客户端并确保用户已登录
 * 如果未登录则抛出异常，否则返回 supabase 实例和 user 对象
 * 
 * 这是一个服务端专用的辅助函数，供 Server Actions 共享使用。
 */
export async function getAuthSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not found");

  return { supabase, user };
}
