"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { PasswordField } from "@/components/form/passwordField";
import { SubmitButton } from "@/components/form/submitButton";
import { TextField } from "@/components/form/textField";
import { getErrorMessage } from "@/lib/error.lib";
import { useLogin } from "../hooks/useLogin";
import { loginSchema } from "@/features/validation/authSchema";
import { AuthCard, authLinkClass } from "./authCard";
import { GoogleLoginButton } from "./googleLoginButton";

// setelah login sukses, cache session terisi -> <GuestOnly> di halaman yang mengarahkan user
export function LoginForm() {
  const { mutate, isPending, error } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  return (
    <AuthCard
      title="Log in to Pinkara"
      description="Log in to check out, pay for your orders, and request custom arrangements."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className={authLinkClass}>
            Sign up
          </Link>
        </>
      }
    >
      <GoogleLoginButton />

      <form
        noValidate
        onSubmit={handleSubmit((values) =>
          mutate(values, { onSuccess: (user) => toast.success(`Welcome back, ${user.name}!`) }),
        )}
        className="flex flex-col gap-4"
      >
        {error && <FormAlert message={getErrorMessage(error)} />}

        <TextField
          id="email"
          type="email"
          label="Email"
          inputMode="email"
          autoComplete="email"
          placeholder="name@email.com"
          required
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="flex flex-col gap-2">
          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            required
            error={errors.password?.message}
            {...register("password")}
          />
          <Link href="/forgot-password" className={`${authLinkClass} self-end py-1 text-sm`}>
            Forgot password?
          </Link>
        </div>

        <SubmitButton isPending={isPending} pendingLabel="Logging in...">
          Log in
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
