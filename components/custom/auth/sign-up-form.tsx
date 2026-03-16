"use client";

// 注册表单组件
//
// 与 SignInForm 的核心区别：
//   - Schema 增加了 .refine() 跨字段校验（密码确认），不能用单字段规则完成
//   - 注册成功后由客户端执行 router.push("/sign-in")，因为 Server Action 不需要在内部 redirect

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";

import { SignUpFormValues, signUpSchema } from "@/lib/schemas/sign-up";
import { useRouter } from "next/navigation";
import { signUp } from "@/server/auth";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const SignUpForm = () => {
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      {/* Card */}
      <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
        {/* Primary color top accent */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--color-primary), transparent)",
          }}
        />

        <div className="px-7 py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-card-foreground tracking-tight">
              Create your account
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Start tracking your portfolio in minutes
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
              className="space-y-4"
            >
              {/* Full Name */}
              <motion.div variants={fieldVariants} className="space-y-1.5">
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  Full Name
                </label>
                <Input
                  {...register("name")}
                  id="name"
                  type="text"
                  placeholder="Fujimoto"
                />
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      key="name-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs text-destructive overflow-hidden"
                    >
                      {errors.name.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Email */}
              <motion.div variants={fieldVariants} className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="fujimoto@example.com"
                />
                <AnimatePresence mode="wait">
                  {errors.email ? (
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
                  ) : (
                    <motion.p
                      key="email-hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs text-muted-foreground"
                    >
                      We&apos;ll use this to contact you.
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password */}
              <motion.div variants={fieldVariants} className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  {...register("password")}
                  id="password"
                  type="password"
                />
                <AnimatePresence mode="wait">
                  {errors.password ? (
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
                  ) : (
                    <motion.p
                      key="password-hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs text-muted-foreground"
                    >
                      Must be at least 6 characters.
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={fieldVariants} className="space-y-1.5">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <Input
                  {...register("confirmPassword")}
                  id="confirm-password"
                  type="password"
                />
                <AnimatePresence mode="wait">
                  {errors.confirmPassword ? (
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
                  ) : (
                    <motion.p
                      key="confirm-hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs text-muted-foreground"
                    >
                      Please confirm your password.
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Buttons */}
              <motion.div variants={fieldVariants} className="space-y-3 pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cursor-pointer"
                >
                  {isSubmitting ? "Creating account…" : "Create Account"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full cursor-pointer"
                >
                  Continue with Google
                </Button>
              </motion.div>

              {/* Footer link */}
              <motion.p variants={fieldVariants} className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="/sign-in" className="text-primary hover:text-primary/80 transition-colors">
                  Sign in
                </a>
              </motion.p>
            </motion.div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default SignUpForm;
