import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { GuestOnly } from "@/hoc/authGuard";
import { RegisterForm } from "@/features/auth/components/registerForm";

export const metadata: Metadata = { title: "Sign Up | Pinkara Florist" };

// registrasi customer (email + password / Google). Admin tidak bisa daftar sendiri (PRD §5)
export default function RegisterPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <GuestOnly>
        <RegisterForm />
      </GuestOnly>
    </Suspense>
  );
}
