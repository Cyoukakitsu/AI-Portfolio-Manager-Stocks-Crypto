"use client";

// 登录表单组件
//
// 架构：react-hook-form（表单状态管理）+ Zod（校验规则）+ Server Action（提交逻辑）
// 校验在两处发生：
//   1. 客户端：提交时用 Zod 校验，提交后随输入重新校验（react-hook-form 的默认 mode）
//   2. 服务端 Server Action 中：二次校验，防止绕过前端直接请求

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

import { signInSchema, SignInFormValues } from "@/features/auth/schemas/sign-in";
import GoogleButton from "./google-button";
import ForgotPasswordForm from "./forgot-password-form";
import {
  AuthCard,
  AuthField,
  AuthHeader,
  authLinkClass,
  authSubtleLinkClass,
  useFadeDuration,
} from "./auth-card";
import { signIn } from "@/features/auth/server/auth";
import { Link } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SignInForm = () => {
  const fadeDuration = useFadeDuration(0.15);
  const t = useTranslations("auth.signIn");
  const [view, setView] = useState<"signIn" | "forgotPassword">("signIn");
  const [loginFailed, setLoginFailed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInFormValues) => {
    setLoginFailed(false);
    const result = await signIn(data);
    if (result?.error) {
      toast.error(t(result.error as Parameters<typeof t>[0]));
      setLoginFailed(true);
    }
  };

  return (
    <AuthCard>
      <AnimatePresence mode="wait" initial={false}>
        {view === "forgotPassword" ? (
          <ForgotPasswordForm key="forgot" onBack={() => setView("signIn")} />
        ) : (
          <motion.div
            key="sign-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeDuration }}
          >
            <AuthHeader title={t("title")} subtitle={t("subtitle")} />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <AuthField
                id="email"
                label={t("email")}
                type="email"
                placeholder="fujimoto@example.com"
                registration={register("email")}
                error={errors.email?.message}
              />

              <AuthField
                id="password"
                label={t("password")}
                type="password"
                registration={register("password")}
                error={errors.password?.message}
                labelAction={
                  <button
                    type="button"
                    onClick={() => setView("forgotPassword")}
                    className={authSubtleLinkClass}
                  >
                    {t("forgotPassword")}
                  </button>
                }
              />

              <div className="space-y-3 pt-1">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? t("signingIn") : t("submit")}
                </Button>
                <AnimatePresence>
                  {loginFailed && (
                    <motion.p
                      key="google-hint"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: fadeDuration }}
                      className="overflow-hidden text-center text-xs text-muted-foreground"
                    >
                      {t("googleHint")}
                    </motion.p>
                  )}
                </AnimatePresence>
                <GoogleButton />
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {t("noAccount")}{" "}
                <Link href="/sign-up" className={authLinkClass}>
                  {t("signUp")}
                </Link>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  );
};

export default SignInForm;
