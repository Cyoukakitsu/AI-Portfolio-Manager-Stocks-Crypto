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
import { AuthCard, AuthHeader, FieldMessage } from "./auth-card";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <div className="space-y-1.5">
          <Label htmlFor="new-password">{t("newPassword")}</Label>
          <Input
            {...register("password")}
            id="new-password"
            type="password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "new-password-message" : undefined}
          />
          <FieldMessage
            id="new-password-message"
            error={errors.password?.message}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
          <Input
            {...register("confirmPassword")}
            id="confirm-password"
            type="password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? "confirm-password-message" : undefined
            }
          />
          <FieldMessage
            id="confirm-password-message"
            error={errors.confirmPassword?.message}
          />
        </div>

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
