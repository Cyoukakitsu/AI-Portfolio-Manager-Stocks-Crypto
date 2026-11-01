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
import {
  AuthField,
  AuthHeader,
  authLinkClass,
  useFadeDuration,
} from "./auth-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const fadeDuration = useFadeDuration(0.15);
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: fadeDuration }}
    >
      <AuthHeader title={t("title")} subtitle={t("subtitle")} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthField
          id="forgot-email"
          label={t("email")}
          type="email"
          placeholder="fujimoto@example.com"
          registration={register("email")}
          error={errors.email?.message}
        />

        <div className="pt-1">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? t("sending") : t("submit")}
          </Button>
        </div>

        <p className="text-center text-sm">
          <button
            type="button"
            onClick={onBack}
            className={cn("cursor-pointer", authLinkClass)}
          >
            {t("backToSignIn")}
          </button>
        </p>
      </form>
    </motion.div>
  );
};

export default ForgotPasswordForm;
