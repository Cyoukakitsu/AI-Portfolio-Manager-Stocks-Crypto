"use server";

//Server Action（ SignUp/SignIn Logic ）

import { signInSchema } from "@/lib/schemas/sign-in";
import { signUpSchema } from "@/lib/schemas/sign-up";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

//
export async function signUp(formatData: unknown) {
  // 零信任原则：参数类型为 unknown，不信任任何外部传入的数据
  // safeParse 验证失败不会抛出异常，而是返回 { success: false }
  const result = signUpSchema.safeParse(formatData);
  if (!result.success) {
    return {
      // 不暴露具体验证错误，防止黑客通过错误信息探测系统逻辑
      error: "Validation failed",
    };
  }
  const supabase = await createClient();

  // 使用 result.data 而不是原始 formData
  // result.data 是经过 Zod 验证后 100% 干净的数据
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    // 不返回 error.message，避免将 Supabase 内部错误信息暴露给前端
    return {
      error: "Registration failed. Please try again.",
    };
  }
  return {
    success: true,
  };
}

// SignIn
export async function signIn(formatData: unknown) {
  const result = signInSchema.safeParse(formatData);
  if (!result.success) {
    return {
      error: "Validation failed",
    };
  }

  const supabase = await createClient();

  //Supabase API
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    // 不区分「邮箱不存在」还是「密码错误」
    // 统一返回模糊提示，防止黑客通过不同错误信息判断账号是否存在（撞库攻击）
    return {
      error: "Invalid credentials. Please check your email and password.",
    };
  }
  redirect("/dashboard/assets");
}
