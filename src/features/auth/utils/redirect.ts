import type { UserRole } from "@/types/auth.type";

// halaman awal setelah login per role
export const homeByRole = (role: UserRole) => (role === "ADMIN" ? "/admin" : "/");

// ?redirect= hanya boleh path internal (cegah open redirect ke situs lain, mis. "//evil.com")
export function getSafeRedirect(value: string | null | undefined, role: UserRole) {
  if (value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return value;
  }
  return homeByRole(role);
}
