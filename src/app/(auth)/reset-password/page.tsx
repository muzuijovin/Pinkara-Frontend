import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { ResetPasswordForm } from "@/features/auth/components/resetPasswordForm";

export const metadata: Metadata = { title: "Reset Password | Pinkara Florist" };

// langkah 2 lupa password: dibuka dari link email /reset-password?token=... (PRD §5)
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
