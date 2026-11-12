"use client";

import { toast } from "react-toastify";
import { getErrorMessage } from "@/lib/error.lib";
import { useResendVerification } from "../hooks/useResendVerification";

// kirim ulang email verifikasi (wajib login)
export function ResendVerificationButton({ className = "" }: { className?: string }) {
  const { mutate, isPending } = useResendVerification();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-busy={isPending}
      onClick={() =>
        mutate(undefined, {
          onSuccess: () => toast.success("Verification email sent. Please check your inbox."),
          onError: (error) => toast.error(getErrorMessage(error)),
        })
      }
      className={`btn ${className}`}
    >
      {isPending && <span aria-hidden="true" className="loading loading-spinner loading-xs" />}
      {isPending ? "Sending..." : "Resend verification email"}
    </button>
  );
}
