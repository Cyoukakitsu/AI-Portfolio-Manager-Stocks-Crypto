"use client";

// 忘记密码表单——发送重置邮件
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
} from "@/features/auth/schemas/forgot-password";
import { resetPasswordEmail } from "@/features/auth/server/auth";
import { AuthHeader, FieldMessage, authLinkClass } from "./auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const t = useTranslations("auth.forgotPassword");
  const locale = useLocale();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await resetPasswordEmail(data.email, locale);
    toast.success(t("successToast"));
    onBack();
  };

  return (
    <motion.div
      key="forgot-password"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <AuthHeader title={t("title")} subtitle={t("subtitle")} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="forgot-email">{t("email")}</Label>
          <Input
            {...register("email")}
            id="forgot-email"
            type="email"
            placeholder="fujimoto@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "forgot-email-message" : undefined}
          />
          <FieldMessage
            id="forgot-email-message"
            error={errors.email?.message}
          />
        </div>

        <div className="pt-1">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? t("sending") : t("submit")}
          </Button>
        </div>

        <p className="text-center text-sm">
          <button
            type="button"
            onClick={onBack}
            className={`cursor-pointer ${authLinkClass}`}
          >
            {t("backToSignIn")}
          </button>
        </p>
      </form>
    </motion.div>
  );
};

export default ForgotPasswordForm;
