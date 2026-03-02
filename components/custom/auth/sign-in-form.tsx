"use client";

// 登录表单组件
//
// 架构：react-hook-form（表单状态管理）+ Zod（校验规则）+ Server Action（提交逻辑）
// 校验在两处发生：
//   1. 客户端：Zod 实时校验，给出即时错误提示
//   2. 服务端 Server Action 中：二次校验，防止绕过前端直接请求

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { signInSchema, SignInFormValues } from "@/lib/schemas/sign-in";
import { signIn } from "@/services/auth";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SignInForm = () => {
  // zodResolver 将 Zod schema 接入 react-hook-form，
  // 使 handleSubmit 自动在提交前运行校验，errors 对象自动填充错误信息
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 登录成功后 Server Action 内部执行 redirect()，无需在这里跳转
  // 登录失败时 Server Action 返回 { error }，在这里展示给用户
  const onSubmit = async (data: SignInFormValues) => {
    const result = await signIn(data);
    if (result?.error) {
      alert(result.error);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* handleSubmit 包裹 onSubmit，确保校验通过后才执行提交逻辑 */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              {/* email */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                {/* register("email") 将 input 注册到 react-hook-form，自动处理 value/onChange/ref */}
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="fujimoto@example.com"
                />
                {errors.email && (
                  <FieldDescription>{errors.email.message}</FieldDescription>
                )}
              </Field>

              {/* password */}
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input {...register("password")} type="password" />
                {errors.password && (
                  <FieldDescription>{errors.password.message}</FieldDescription>
                )}
              </Field>

              {/* 提交期间禁用按钮，防止重复提交 */}
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Loading..." : "Login"}
                </Button>
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="/sign-up">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInForm;
