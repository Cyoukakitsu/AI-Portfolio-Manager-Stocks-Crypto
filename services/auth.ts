"use server";

// Server Actions：处理注册 / 登录逻辑
//
// "use server" 标记让这些函数只在服务端执行，
// 敏感操作（如写数据库、读环境变量）不会暴露给浏览器。

import { signInSchema } from "@/lib/schemas/sign-in";
import { signUpSchema } from "@/lib/schemas/sign-up";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// 注册
// 参数类型为 unknown 而非具体类型，体现"零信任"原则：
// 来自客户端的数据不能被信任，必须在服务端重新校验
export async function signUp(formatData: unknown) {
  // safeParse 校验失败时返回 { success: false }，而非抛出异常，
  // 让调用方可以优雅处理错误而不被 try/catch 打断流程
  const result = signUpSchema.safeParse(formatData);
  if (!result.success) {
    return {
      // 不暴露具体校验错误，防止黑客通过错误信息探测系统逻辑（信息泄露）
      error: "Validation failed",
    };
  }
  const supabase = await createClient();

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

  // redirect() 必须在 try/catch 外调用，否则 Next.js 内部抛出的跳转信号会被捕获
  redirect("/dashboard/assets");
}
