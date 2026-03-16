"use client";

// 注册表单组件
//
// 与 SignInForm 的核心区别：
//   - Schema 增加了 .refine() 跨字段校验（密码确认），不能用单字段规则完成
//   - 注册成功后由客户端执行 router.push("/sign-in")，因为 Server Action 不需要在内部 redirect

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SignUpFormValues, signUpSchema } from "@/lib/schemas/sign-up";
import { useRouter } from "next/navigation";
import { signUp } from "@/server/auth";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SignUpForm = () => {
  const {
    register, // 绑定表单输入框的方法
    handleSubmit, // 处理表单提交的方法（自动触发校验）
    formState: { errors, isSubmitting }, // 表单状态：校验错误、是否正在提交
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema), // 关键：让 React Hook Form 用 Zod 做校验
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // 初始化路由（用于注册成功后跳转）
  const router = useRouter();

  // 注册成功后跳转到登录页，而非直接登录，
  // 原因：Supabase 默认需要邮件验证，跳转到登录页更符合此流程
  const onSubmit = async (data: SignUpFormValues) => {
    // 调用服务端 signUp 函数，传入前端校验后的表单数据
    const result = await signUp(data);

    if (result.error) {
      // Server Action 返回的 error 可能是字符串或对象，统一处理
      alert(
        typeof result.error === "string" ? result.error : "Validation failed",
      );
    } else {
      // 注册成功：跳转到登录页
      router.push("/sign-in");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* name */}
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input {...register("name")} type="text" placeholder="Fujimoto" />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </Field>

            {/* email */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...register("email")}
                type="email"
                placeholder="fujimoto@example.com"
              />
              {/* 有错误时显示错误，否则显示提示文字（两者互斥，避免 UI 跳动） */}
              {errors.email ? (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              ) : (
                <FieldDescription>
                  We&apos;ll use this to contact you.{" "}
                </FieldDescription>
              )}
            </Field>

            {/* password */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input {...register("password")} type="password" />
              {errors.password ? (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              ) : (
                <FieldDescription>
                  Must be at least 6 characters long.
                </FieldDescription>
              )}
            </Field>

            {/* confirmPassword：错误由 Zod .refine() 产生，挂载在 confirmPassword 字段上 */}
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input {...register("confirmPassword")} type="password" />
              {errors.confirmPassword ? (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              ) : (
                <FieldDescription>
                  Please confirm your password.
                </FieldDescription>
              )}
            </Field>

            {/* buttons */}
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing up..." : "Create account"}
                </Button>
                <Button variant="outline" type="button">
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="/sign-in">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
