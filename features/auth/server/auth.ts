"use server";

// Server Actions：处理注册 / 登录逻辑
//参考https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs

import { signInSchema } from "@/features/auth/schemas/sign-in";
import { signUpSchema } from "@/features/auth/schemas/sign-up";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// 注册
// 参数类型为 unknown 而非具体类型，体现"零信任"原则：
// 来自客户端的数据不能被信任，必须在服务端重新校验
export async function signUp(formatData: unknown) {
  const supabase = await createClient();
  // safeParse 校验失败时返回 { success: false }，而非抛出异常，
  // 让调用方可以优雅处理错误而不被 try/catch 打断流程
  const result = signUpSchema.safeParse(formatData);
  if (!result.success) {
    return {
      // 不暴露具体校验错误，防止黑客通过错误信息探测系统逻辑（信息泄露）
      error: "Validation failed",
    };
  }

  // 使用 result.data（Zod 净化后的数据），而非直接透传原始 formatData，
  // 避免用户注入额外字段（如 role: "admin"）影响注册逻辑
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    // 不返回 error.message，避免将 Supabase 内部错误暴露给前端
    return {
      error: "Registration failed. Please try again.",
    };
  }
  return {
    success: true,
  };
}

// 登录
export async function signIn(formatData: unknown) {
  const result = signInSchema.safeParse(formatData);
  if (!result.success) {
    return {
      error: "Validation failed",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    // 故意不区分"邮箱不存在"和"密码错误"，统一返回模糊提示，
    // 防止攻击者通过不同错误信息判断账号是否存在（账号枚举攻击）
    return {
      error: "Invalid credentials. Please check your email and password.",
    };
  }

  redirect("/dashboard/assets");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function changePassword(newPassword: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { error: "パスワードの変更に失敗しました。もう一度お試しください。" };
  }
  return { success: true };
}
