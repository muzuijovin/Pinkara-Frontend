"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { PasswordField } from "@/components/form/passwordField";
import { SubmitButton } from "@/components/form/submitButton";
import { authLinkClass } from "@/features/auth/components/authCard";
import { PasswordRules } from "@/features/auth/components/passwordRules";
import { useChangePassword } from "@/features/auth/hooks/useChangePassword";
import { changePasswordSchema } from "@/features/validation/authSchema";
import { getErrorMessage } from "@/lib/error.lib";
import { PROFILE_QUERY_KEY } from "../hooks/useProfile";

const EMPTY_FORM = { currentPassword: "", newPassword: "", confirmPassword: "" };

// password lama wajib kalau akun sudah punya password
const schemaWithCurrentPassword = changePasswordSchema.refine((data) => data.currentPassword.length > 0, {
  message: "Current password is required",
  path: ["currentPassword"],
});

// ganti password (PATCH /auth/change-password).
// Kolom password lama selalu tampil: wajib untuk akun yang sudah punya password,
// opsional untuk akun Google-only (hasPassword=false) yang belum pernah membuat password
export function UpdatePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useChangePassword();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(hasPassword ? schemaWithCurrentPassword : changePasswordSchema),
    defaultValues: EMPTY_FORM,
  });
  const newPassword = useWatch({ control, name: "newPassword" });

  return (
    <section aria-labelledby="password-title" className="card border border-base-300 bg-base-100">
      <form
        noValidate
        onSubmit={handleSubmit((values) =>
          mutate(values, {
            onSuccess: () => {
              toast.success("Your password has been changed.");
              reset(EMPTY_FORM);
              // akun Google-only sekarang punya password
              queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
            },
          }),
        )}
        className="card-body gap-5 p-6"
      >
        <header>
          <h2 id="password-title" className="text-lg font-semibold text-ink">
            Change password
          </h2>
          <p className="text-sm text-ink-muted">
            Once changed, you&apos;ll be logged out of your other devices. You&apos;ll stay logged in on this one.
          </p>
        </header>

        {error && <FormAlert message={getErrorMessage(error)} />}

        <div className="flex max-w-md flex-col gap-5">
          <div className="flex flex-col gap-2">
            <PasswordField
              id="currentPassword"
              label={hasPassword ? "Current password" : "Current password (optional)"}
              autoComplete="current-password"
              required={hasPassword}
              hint={
                hasPassword
                  ? undefined
                  : "You signed up with Google and haven't set a password yet, so you can leave this empty."
              }
              error={errors.currentPassword?.message}
              {...register("currentPassword")}
            />
            {hasPassword && (
              <Link href="/forgot-password" className={`${authLinkClass} self-end py-1 text-sm`}>
                Forgot your current password?
              </Link>
            )}
          </div>

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
        </div>

        <div className="flex justify-end border-t border-base-300 pt-5">
          <SubmitButton isPending={isPending} pendingLabel="Saving..." className="sm:w-auto sm:px-6">
            Update password
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}
