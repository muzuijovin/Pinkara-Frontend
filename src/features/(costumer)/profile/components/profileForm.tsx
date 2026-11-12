"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PiSealCheck, PiWarningCircle } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { SubmitButton } from "@/components/form/submitButton";
import { TextField } from "@/components/form/textField";
import { ResendVerificationButton } from "@/features/auth/components/resendVerificationButton";
import { formatDateWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { Profile } from "@/types/profile.type";
import { useUpdateProfile } from "../hooks/useProfile";
import { profileSchema } from "@/features/validation/profileSchema";

// tab "Personal info": 1 kartu — nama & nomor HP bisa diubah, email hanya dibaca
export function ProfileForm({ profile }: { profile: Profile }) {
  const { mutate, isPending, error } = useUpdateProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile.name, phone: profile.phone ?? "" },
  });

  const loginMethods = [profile.hasPassword && "email & password", profile.isGoogleLinked && "Google"]
    .filter(Boolean)
    .join(" and ");

  return (
    <section aria-labelledby="profile-data-title" className="card border border-base-300 bg-base-100">
      <form
        noValidate
        onSubmit={handleSubmit((values) =>
          mutate(values, {
            onSuccess: (updated) => {
              toast.success("Your personal info has been saved.");
              reset({ name: updated.name, phone: updated.phone ?? "" });
            },
          }),
        )}
        className="card-body gap-6 p-6"
      >
        <header>
          <h2 id="profile-data-title" className="text-lg font-semibold text-ink">
            Personal info
          </h2>
          <p className="text-sm text-ink-muted">Used for your orders and so the courier can reach you.</p>
        </header>

        {error && <FormAlert message={getErrorMessage(error)} />}

        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <TextField
            id="name"
            label="Full name"
            autoComplete="name"
            required
            error={errors.name?.message}
            {...register("name")}
          />
          <TextField
            id="phone"
            type="tel"
            label="Phone number (optional)"
            inputMode="tel"
            autoComplete="tel"
            placeholder="081234567890"
            error={errors.phone?.message}
            {...register("phone")}
          />

          {/* email hanya dibaca: dipakai untuk masuk, mengubahnya perlu verifikasi ulang */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="email" className="text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={profile.email}
              readOnly
              aria-describedby="email-status"
              className="input h-11 w-full cursor-default border-base-300 bg-surface-muted text-base text-ink-muted sm:text-sm"
            />
            <div id="email-status" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {profile.emailVerifiedAt ? (
                <span className="inline-flex items-center gap-1 font-medium text-success-text">
                  <PiSealCheck aria-hidden="true" size={14} />
                  Verified
                </span>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1 font-medium text-danger-text">
                    <PiWarningCircle aria-hidden="true" size={14} />
                    Not verified
                  </span>
                  <ResendVerificationButton className="btn-link btn-xs h-auto min-h-0 px-0 text-accent-text" />
                </>
              )}
              <span className="text-ink-muted">Email can&apos;t be changed.</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-base-300 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-muted">
            {loginMethods && <>Signs in with {loginMethods} · </>}
            Joined {formatDateWIB(profile.createdAt)}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {isDirty && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => reset()}
                className="btn btn-ghost h-11 text-ink"
              >
                Cancel
              </button>
            )}
            <SubmitButton isPending={isPending} pendingLabel="Saving..." className="sm:w-auto sm:px-6">
              Save changes
            </SubmitButton>
          </div>
        </div>
      </form>
    </section>
  );
}
