// 注册表单的 Zod 校验 Schema

import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(1, "pleace  enter a correct name"),
    email: z.email("pleace  enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  // .refine 用于跨字段校验（单个字段的 .min/.max 无法做到这一点）
  // path: ["confirmPassword"] 确保错误挂载在 confirmPassword 字段上，方便表单定位错误位置
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// z.infer 从 Schema 自动推导出 TypeScript 类型，无需手动维护类型定义
export type SignUpFormValues = z.infer<typeof signUpSchema>;
