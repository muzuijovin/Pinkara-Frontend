"use client";

import Link from "next/link";
import { redirect, usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { PiLockKey } from "react-icons/pi";
import type { UserRole } from "@/types/auth.type";
import { PageLoader } from "@/components/ui/pageLoader";
import { AuthCard } from "@/features/auth/components/authCard";
import { useSession } from "@/features/auth/hooks/useSession";
import { getSafeRedirect } from "@/features/auth/utils/redirect";

// halaman wajib login (customer & admin). Ini hanya untuk UX — BE tetap mengecek token & role
// di setiap request (PRD §12.1), jadi aman walau guard ini dilewati.
export function RequireAuth({ roles, children }: { roles?: UserRole[]; children: ReactNode }) {
  const pathname = usePathname();
  const { data: user, isPending } = useSession();

  // null = baru saja logout -> useLogout sedang mengarahkan ke beranda, jangan lempar ke /login
  if (isPending || user === null) return <PageLoader />;
  if (!user) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  if (roles && !roles.includes(user.role)) {
    return (
      <AuthCard
        icon={<PiLockKey size={24} />}
        title="Access denied"
        description="Your account doesn't have permission to view this page."
      >
        <Link href="/" className="btn btn-primary h-11 w-full text-[15px]">
          Back to home
        </Link>
      </AuthCard>
    );
  }

  return children;
}

// halaman khusus tamu (login & daftar): kalau sudah login, arahkan ke ?redirect= atau halaman awal role
export function GuestOnly({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const { data: user } = useSession();

  if (user) redirect(getSafeRedirect(searchParams.get("redirect"), user.role));

  return children;
}
