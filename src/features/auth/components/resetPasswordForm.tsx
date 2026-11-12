"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { PiLinkBreak } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { PasswordField } from "@/components/form/passwordField";
import { SubmitButton } from "@/components/form/submitButton";
import { getErrorMessage } from "@/lib/error.lib";
import { useResetPassword } from "../hooks/useResetPassword";
import { resetPasswordSchema } from "@/features/validation/authSchema";
import { AuthCard, authLinkClass } from "./authCard";
import { PasswordRules } from "./passwordRules";

// langkah 2 lupa password: dibuka dari link email /reset-password?token=...
export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const { mutate, isPending, error } = useResetPassword();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });
  const newPassword = useWatch({ control, name: "newPassword" });

  if (!token) {
    return (
      <AuthCard
        icon={<PiLinkBreak size={24} />}
        title="Invalid link"
        description="This password reset link is incomplete. Open the link from your email again, or request a new one."
      >
        <Link href="/forgot-password" className="btn btn-primary h-11 w-full text-[15px]">
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create a new password"
      description="Once your password is changed, you'll be logged out of all devices and need to log in again."
      footer={
        <Link href="/forgot-password" className={authLinkClass}>
          Link expired? Request a new one
        </Link>
      }
    >
      <form
        noValidate
        onSubmit={handleSubmit((values) =>
          mutate(
            { ...values, token },
            {
              onSuccess: () => {
                toast.success("Your password has been changed. Please log in with your new password.");
                router.replace("/login");
              },
            },
          ),
        )}
        className="flex flex-col gap-4"
      >
        {error && <FormAlert message={getErrorMessage(error)} />}

        <div className="flex flex-col gap-2">
          <PasswordField
            id="newPassword"
            label="New password"
            autoComplete="new-password"
            required
            error={errors.newPassword?.message}
            aria-describedby="password-rules"
            {...register("newPassword")}
          />
          <PasswordRules id="password-rules" value={newPassword} />
        </div>
        <PasswordField
          id="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <SubmitButton isPending={isPending} pendingLabel="Saving...">
          Save new password
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
