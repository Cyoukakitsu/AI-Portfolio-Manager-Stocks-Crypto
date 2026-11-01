// 注册表单的 Zod 校验 Schema

import { z } from "zod";
import {
  PASSWORDS_MISMATCH,
  passwordSchema,
  passwordsMatch,
} from "./password";

export const signUpSchema = z
  .object({
    name: z.string().min(1, "please enter a correct name"),
    email: z.email("please enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, PASSWORDS_MISMATCH);

// z.infer 从 Schema 自动推导出 TypeScript 类型，无需手动维护类型定义
export type SignUpFormValues = z.infer<typeof signUpSchema>;
