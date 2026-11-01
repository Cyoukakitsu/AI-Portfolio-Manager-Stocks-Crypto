"use client";

// 注册表单组件
//
// 与 SignInForm 的核心区别：
//   - Schema 增加了 .refine() 跨字段校验（密码确认），不能用单字段规则完成
//   - 注册成功后由客户端执行 router.push("/sign-in")，因为 Server Action 不需要在内部 redirect

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { SignUpFormValues, signUpSchema } from "@/features/auth/schemas/sign-up";
import GoogleButton from "./google-button";
import { AuthCard, AuthField, AuthHeader, authLinkClass } from "./auth-card";
import { useRouter, Link } from "@/i18n/navigation";
import { signUp } from "@/features/auth/server/auth";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const SignUpForm = () => {
  const t = useTranslations("auth.signUp");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const router = useRouter();

  const onSubmit = async (data: SignUpFormValues) => {
    const result = await signUp(data);
    if (result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : "Validation failed",
      );
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <AuthCard>
      <AuthHeader title={t("title")} subtitle={t("subtitle")} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthField
          id="name"
          label={t("fullName")}
          placeholder="Fujimoto"
          registration={register("name")}
          error={errors.name?.message}
        />

        <AuthField
          id="email"
          label={t("email")}
          type="email"
          placeholder="fujimoto@example.com"
          registration={register("email")}
          error={errors.email?.message}
          hint={t("emailHint")}
        />

        <AuthField
          id="password"
          label={t("password")}
          type="password"
          registration={register("password")}
          error={errors.password?.message}
          hint={t("passwordHint")}
        />

        <AuthField
          id="confirm-password"
          label={t("confirmPassword")}
          type="password"
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
          hint={t("confirmHint")}
        />

        <div className="space-y-3 pt-1">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? t("creating") : t("submit")}
          </Button>
          <GoogleButton />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t("hasAccount")}{" "}
          <Link href="/sign-in" className={authLinkClass}>
            {t("signIn")}
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default SignUpForm;
