"use server";

//Server Action（ SignUp/SignIn Logic ）

import { SignInFormValues, signInSchema } from "@/lib/schemas/sign-in";
import { signUpSchema, SignUpFormValues } from "@/lib/schemas/sign-up";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

//
export async function signUp(formatData: SignUpFormValues) {
  //Zod Validation
  const result = signUpSchema.safeParse(formatData);
  if (!result.success) {
    return {
      error: result.error.format(),
    };
  }
  const supabase = await createClient();

  //Supabase API
  const { error } = await supabase.auth.signUp({
    email: formatData.email,
    password: formatData.password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }
  return {
    success: true,
  };
}

// SignIn
export async function signIn(formatData: SignInFormValues) {
  const result = signInSchema.safeParse(formatData);
  if (!result.success) {
    return {
      error: result.error.format(),
    };
  }

  const supabase = await createClient();

  //Supabase API
  const { error } = await supabase.auth.signInWithPassword({
    email: formatData.email,
    password: formatData.password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }
  redirect("/assets");
}
