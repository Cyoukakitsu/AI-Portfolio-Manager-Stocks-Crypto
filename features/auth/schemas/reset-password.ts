// 重置密码表单的 Zod 校验 Schema
import { z } from "zod";
import {
  PASSWORDS_MISMATCH,
  passwordSchema,
  passwordsMatch,
} from "./password";

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, PASSWORDS_MISMATCH);

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
