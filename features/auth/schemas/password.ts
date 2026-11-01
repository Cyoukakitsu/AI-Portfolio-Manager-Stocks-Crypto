// 密码相关的共用校验规则：登录、注册、重置密码与 Server Action 共用同一份
import { z } from "zod";

// TODO: 补充 6 的依据（Supabase 的最小长度设置，还是产品要求）
export const MIN_PASSWORD_LENGTH = 6;

export const passwordSchema = z
  .string()
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  );

// 跨字段校验（单个字段的 .min/.max 无法做到）：配合 z.object(...).refine(passwordsMatch, PASSWORDS_MISMATCH)
export const passwordsMatch = (data: {
  password: string;
  confirmPassword: string;
}) => data.password === data.confirmPassword;

// path 指向 confirmPassword，错误才会显示在"确认密码"这个字段下
export const PASSWORDS_MISMATCH = {
  message: "Passwords do not match",
  path: ["confirmPassword"],
};
