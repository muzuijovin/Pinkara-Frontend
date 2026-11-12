import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { GuestOnly } from "@/hoc/authGuard";
import { LoginForm } from "@/features/auth/components/loginForm";

export const metadata: Metadata = { title: "Log In | Pinkara Florist" };

// login email + password dan Masuk dengan Google (PRD §5)
// GuestOnly baca ?redirect= (useSearchParams) -> perlu Suspense karena cacheComponents aktif
export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <GuestOnly>
        <LoginForm />
      </GuestOnly>
    </Suspense>
  );
}
