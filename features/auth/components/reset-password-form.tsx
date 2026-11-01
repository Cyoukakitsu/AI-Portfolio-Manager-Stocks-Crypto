"use client";

// 重置密码表单——输入新密码并提交
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  resetPasswordSchema,
  ResetPasswordFormValues,
} from "@/features/auth/schemas/reset-password";
import { updatePassword } from "@/features/auth/server/auth";
import { AuthCard, AuthField, AuthHeader } from "./auth-card";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const ResetPasswordForm = () => {
  const t = useTranslations("auth.resetPassword");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    const result = await updatePassword(data.password);
    if (result?.error) {
      toast.error(t("errorToast"));
    } else {
      toast.success(t("successToast"));
      router.push("/sign-in");
    }
  };

  return (
    <AuthCard>
      <AuthHeader title={t("title")} subtitle={t("subtitle")} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthField
          id="new-password"
          label={t("newPassword")}
          type="password"
          registration={register("password")}
          error={errors.password?.message}
        />

        <AuthField
          id="confirm-password"
          label={t("confirmPassword")}
          type="password"
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <div className="pt-1">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? t("updating") : t("submit")}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
};

export default ResetPasswordForm;
