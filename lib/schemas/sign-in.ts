// SignIn Zod Validation rules

import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
