// SignUp Zod Validation rules

import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(1, "pleace  enter a correct name"),
    email: z.email("pleace  enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;
