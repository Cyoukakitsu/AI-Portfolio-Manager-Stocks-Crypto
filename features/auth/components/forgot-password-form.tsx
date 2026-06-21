"use client";

// 忘记密码表单——发送重置邮件
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
} from "@/features/auth/schemas/forgot-password";
import { resetPasswordEmail } from "@/features/auth/server/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-card-foreground tracking-tight">
          {t("title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          initial="hidden"
          animate="show"
          className="space-y-5"
        >
          <motion.div variants={fieldVariants} className="space-y-1.5">
            <label
              htmlFor="forgot-email"
              className="block text-sm font-medium text-foreground"
            >
              {t("email")}
            </label>
            <Input
              {...register("email")}
              id="forgot-email"
              type="email"
              placeholder="fujimoto@example.com"
            />
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  key="email-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-destructive overflow-hidden"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={fieldVariants} className="space-y-3 pt-1">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer"
            >
              {isSubmitting ? t("sending") : t("submit")}
            </Button>
          </motion.div>

          <motion.p
            variants={fieldVariants}
            className="text-center text-sm"
          >
            <button
              type="button"
              onClick={onBack}
              className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              {t("backToSignIn")}
            </button>
          </motion.p>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default ForgotPasswordForm;
