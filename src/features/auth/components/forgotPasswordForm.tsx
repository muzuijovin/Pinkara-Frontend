"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { PiEnvelopeSimple } from "react-icons/pi";
import { FormAlert } from "@/components/form/formAlert";
import { SubmitButton } from "@/components/form/submitButton";
import { TextField } from "@/components/form/textField";
import { getErrorMessage } from "@/lib/error.lib";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { forgotPasswordSchema } from "@/features/validation/authSchema";
import { AuthCard, authLinkClass } from "./authCard";

// langkah 1 lupa password: isi email -> BE kirim link reset (berlaku 1 jam)
export function ForgotPasswordForm() {
  const { mutate, isPending, error, isSuccess, variables } = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });

  const backToLogin = (
    <Link href="/login" className={authLinkClass}>
      Back to log in
    </Link>
  );

  if (isSuccess) {
    return (
      <AuthCard
        icon={<PiEnvelopeSimple size={24} />}
        title="Check your email"
        description={
          <>
            If <strong className="text-ink">{variables.email}</strong> is registered, we&apos;ve sent a link
            to create a new password. The link is valid for 1 hour and can only be used once.
          </>
        }
        footer={backToLogin}
      />
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your account email and we'll send you a link to create a new password."
      footer={backToLogin}
    >
      <form noValidate onSubmit={handleSubmit((values) => mutate(values))} className="flex flex-col gap-4">
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

        <SubmitButton isPending={isPending} pendingLabel="Sending...">
          Send reset link
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
