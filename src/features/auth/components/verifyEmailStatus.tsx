"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PiEnvelopeSimpleOpen, PiLinkBreak, PiSealCheck } from "react-icons/pi";
import { FormAlert } from "@/components/form/formAlert";
import { getErrorMessage } from "@/lib/error.lib";
import { useSession } from "../hooks/useSession";
import { useVerifyEmail } from "../hooks/useVerifyEmail";
import { homeByRole } from "../utils/redirect";
import { AuthCard } from "./authCard";
import { ResendVerificationButton } from "./resendVerificationButton";

// dibuka dari link email /verify-email?token=...
// verifikasi lewat klik tombol (bukan otomatis saat halaman dibuka) supaya token
// tidak terpakai oleh pemindai link di aplikasi email
export function VerifyEmailStatus() {
  const token = useSearchParams().get("token");
  const { data: user } = useSession();
  const { mutate, isPending, isSuccess, error } = useVerifyEmail();

  const resendOrLogin = user ? (
    <ResendVerificationButton className="btn-outline btn-primary h-11 w-full" />
  ) : (
    <Link href="/login" className="btn btn-outline btn-primary h-11 w-full">
      Log in to request a new link
    </Link>
  );

  if (!token) {
    return (
      <AuthCard
        icon={<PiLinkBreak size={24} />}
        title="Invalid verification link"
        description="This verification link is incomplete. Open the link from your email again, or request a new one."
      >
        {resendOrLogin}
      </AuthCard>
    );
  }

  if (isSuccess) {
    return (
      <AuthCard
        icon={<PiSealCheck size={24} />}
        title="Email verified"
        description="Your account is now active. You can check out and request custom orders."
      >
        <Link href={user ? homeByRole(user.role) : "/login"} className="btn btn-primary h-11 w-full text-[15px]">
          {user ? "Start shopping" : "Log in now"}
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={<PiEnvelopeSimpleOpen size={24} />}
      title="Verify your email"
      description="Click the button below to finish verifying your email. The link is valid for 24 hours."
    >
      <div className="flex flex-col gap-4">
        {error && <FormAlert message={getErrorMessage(error, "This verification link is invalid or has expired.")} />}
        <button
          type="button"
          disabled={isPending}
          aria-busy={isPending}
          onClick={() => mutate(token)}
          className="btn btn-primary h-11 w-full text-[15px]"
        >
          {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
          {isPending ? "Verifying..." : "Verify email"}
        </button>
        {error && resendOrLogin}
      </div>
    </AuthCard>
  );
}
