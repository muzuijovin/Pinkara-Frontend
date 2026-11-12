"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { PiEnvelopeSimple } from "react-icons/pi";
import { FormAlert } from "@/components/form/formAlert";
import { PasswordField } from "@/components/form/passwordField";
import { SubmitButton } from "@/components/form/submitButton";
import { TextField } from "@/components/form/textField";
import { getErrorMessage } from "@/lib/error.lib";
import { useRegister } from "../hooks/useRegister";
import { registerSchema } from "@/features/validation/authSchema";
import { AuthCard, authLinkClass } from "./authCard";
import { GoogleLoginButton } from "./googleLoginButton";
import { PasswordRules } from "./passwordRules";

export function RegisterForm() {
  const { mutate, isPending, error, isSuccess, data, variables } = useRegister();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const password = useWatch({ control, name: "password" });

  // BE tidak langsung login-kan user -> minta cek email dulu (PRD §5: verifikasi wajib sebelum checkout)
  if (isSuccess) {
    const emailFailed = data.message.includes("could not send");
    return (
      <AuthCard
        icon={<PiEnvelopeSimple size={24} />}
        title={emailFailed ? "Account created" : "Check your email"}
        description={
          emailFailed ? (
            "But we couldn't send the verification email. Log in to your account, then request a new one."
          ) : (
            <>
              We&apos;ve sent a verification link to <strong className="text-ink">{variables.email}</strong>.
              The link is valid for 24 hours. Don&apos;t forget to check your spam folder.
            </>
          )
        }
      >
        <Link href="/login" className="btn btn-primary h-11 w-full text-[15px]">
          Log in now
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your Pinkara account"
      description="Sign up for faster checkout and to keep track of your orders."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className={authLinkClass}>
            Log in
          </Link>
        </>
      }
    >
      <GoogleLoginButton />

      <form noValidate onSubmit={handleSubmit((values) => mutate(values))} className="flex flex-col gap-4">
        {error && <FormAlert message={getErrorMessage(error)} />}

        <TextField
          id="name"
          label="Full name"
          autoComplete="name"
          placeholder="Your name"
          required
          error={errors.name?.message}
          {...register("name")}
        />
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
            autoComplete="new-password"
            required
            error={errors.password?.message}
            aria-describedby="password-rules"
            {...register("password")}
          />
          <PasswordRules id="password-rules" value={password} />
        </div>
        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <SubmitButton isPending={isPending} pendingLabel="Creating account...">
          Sign up
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
