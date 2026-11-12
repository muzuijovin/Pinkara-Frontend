"use client";

import { NavbarSkeleton } from "@/components/layout/navbarSkeleton";
import { useSession } from "@/features/auth/hooks/useSession";
import { NavbarLanding } from "./navbarLanding";
import { NavbarUser } from "./navbarUser";

// pilih navbar dari GET /auth/me: login -> NavbarUser, tamu -> NavbarLanding
export function NavbarSwitch() {
  const { data: user, isPending } = useSession();

  if (isPending) return <NavbarSkeleton />;
  return user ? <NavbarUser user={user} /> : <NavbarLanding />;
}
