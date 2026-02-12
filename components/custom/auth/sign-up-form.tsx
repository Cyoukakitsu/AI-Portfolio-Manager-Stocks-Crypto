"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SignUpFormValues, signUpSchema } from "@/lib/schemas/sign-up";
import { useRouter } from "next/navigation";
import { signUp } from "@/services/apiAuth";

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
  // react hook form + zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // onSubmit logic, redirect to /sign-in if success
  const router = useRouter();
  const onSubmit = async (data: SignUpFormValues) => {
    const result = await signUp(data);
    if (result.error) {
      alert(
        typeof result.error === "string" ? result.error : "Validation failed",
      );
    } else {
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
              {errors.email ? (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              ) : (
                <FieldDescription>
                  We&apos;ll use this to contact you.{" "}
                </FieldDescription>
              )}
            </Field>

            {/* Password */}
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

            {/* confirm password */}
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
