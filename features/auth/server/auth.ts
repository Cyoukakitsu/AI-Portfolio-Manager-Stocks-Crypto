"use server";

// Server Actions：处理注册 / 登录逻辑
//参考https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs

import { z } from "zod";
import { signInSchema } from "@/features/auth/schemas/sign-in";
import { signUpSchema } from "@/features/auth/schemas/sign-up";
import { forgotPasswordSchema } from "@/features/auth/schemas/forgot-password";
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

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { errorCode: "userNotFound" };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) {
    return { errorCode: "invalidCurrentPassword" };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { errorCode: "updateFailed" };
  }
  return { success: true };
}

export async function resetPasswordEmail(email: unknown) {
  const result = forgotPasswordSchema.safeParse({ email });
  if (!result.success) return { error: "Invalid email" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/ja/reset-password`,
  });

  if (error) return { error: "Failed to send reset email." };
  return { success: true };
}

export async function updatePassword(newPassword: unknown) {
  const result = z.string().min(6, "Password must be at least 6 characters").safeParse(newPassword);
  if (!result.success) return { error: "Password too short" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: result.data });
  if (error) return { error: "Update failed." };
  return { success: true };
}
