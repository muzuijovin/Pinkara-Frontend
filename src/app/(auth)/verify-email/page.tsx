import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { VerifyEmailStatus } from "@/features/auth/components/verifyEmailStatus";

export const metadata: Metadata = { title: "Verify Email | Pinkara Florist" };

// dibuka dari link email /verify-email?token=... (berlaku 24 jam, PRD §5)
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <VerifyEmailStatus />
    </Suspense>
  );
}
