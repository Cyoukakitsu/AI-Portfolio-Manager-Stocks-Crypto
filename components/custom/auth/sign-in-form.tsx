"use client";

// 登录表单组件
//
// 架构：react-hook-form（表单状态管理）+ Zod（校验规则）+ Server Action（提交逻辑）
// 校验在两处发生：
//   1. 客户端：Zod 实时校验，给出即时错误提示
//   2. 服务端 Server Action 中：二次校验，防止绕过前端直接请求

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";

import { signInSchema, SignInFormValues } from "@/lib/schemas/sign-in";
import { signIn } from "@/server/auth";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  // 登录成功后 Server Action 内部执行 redirect()，无需在这里跳转
  // 登录失败时 Server Action 返回 { error }，在这里展示给用户
  const onSubmit = async (data: SignInFormValues) => {
    const result = await signIn(data);
    if (result?.error) {
      toast.error(result.error);
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
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your portfolio account
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

              {/* Password */}
              <motion.div variants={fieldVariants} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  {...register("password")}
                  id="password"
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

              {/* Buttons */}
              <motion.div variants={fieldVariants} className="space-y-3 pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cursor-pointer"
                >
                  {isSubmitting ? "Signing in…" : "Sign In"}
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
                Don&apos;t have an account?{" "}
                <a href="/sign-up" className="text-primary hover:text-primary/80 transition-colors">
                  Sign up
                </a>
              </motion.p>
            </motion.div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default SignInForm;
