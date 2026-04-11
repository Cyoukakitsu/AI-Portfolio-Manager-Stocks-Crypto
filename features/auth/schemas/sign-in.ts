// 登录表单的 Zod 校验 Schema
// 定义在独立文件中，让 Server Action 和 Client 表单共用同一套规则，保证校验逻辑只维护一份

import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// z.infer 从 Schema 自动推导出 TypeScript 类型，无需手动维护类型定义
export type SignInFormValues = z.infer<typeof signInSchema>;
