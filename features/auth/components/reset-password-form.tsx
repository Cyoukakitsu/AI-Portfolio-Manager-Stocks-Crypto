"use client";

// 重置密码表单——输入新密码并提交
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  resetPasswordSchema,
  ResetPasswordFormValues,
} from "@/features/auth/schemas/reset-password";
import { updatePassword } from "@/features/auth/server/auth";
import { useRouter } from "@/i18n/navigation";
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--color-primary), transparent)",
          }}
        />

        <div className="px-7 py-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-card-foreground tracking-tight">
              {t("title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("subtitle")}
            </p>
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
                  htmlFor="new-password"
                  className="block text-sm font-medium text-foreground"
                >
                  {t("newPassword")}
                </label>
                <Input
                  {...register("password")}
                  id="new-password"
                  type="password"
                />
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      key="password-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs text-destructive overflow-hidden"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={fieldVariants} className="space-y-1.5">
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-foreground"
                >
                  {t("confirmPassword")}
                </label>
                <Input
                  {...register("confirmPassword")}
                  id="confirm-password"
                  type="password"
                />
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p
                      key="confirm-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs text-destructive overflow-hidden"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={fieldVariants} className="pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cursor-pointer"
                >
                  {isSubmitting ? t("updating") : t("submit")}
                </Button>
              </motion.div>
            </motion.div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ResetPasswordForm;
