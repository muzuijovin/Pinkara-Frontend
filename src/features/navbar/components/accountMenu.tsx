"use client";

import Link from "next/link";
import { useId } from "react";
import type { IconType } from "react-icons";
import { PiCaretDown, PiChatsCircle, PiFlowerTulip, PiGauge, PiPackage, PiSignOut, PiUser } from "react-icons/pi";
import { UserAvatar } from "@/components/ui/userAvatar";
import { useLogout } from "@/features/auth/hooks/useLogout";
import type { User, UserRole } from "@/types/auth.type";
import { useDropdown } from "../hooks/useDropdown";

type AccountLink = { label: string; href: string; icon: IconType };

// menu akun per role (PRD §3). Alamat & ganti password ada di dalam Profil Saya
const ACCOUNT_LINKS: Record<UserRole, AccountLink[]> = {
  CUSTOMER: [
    { label: "My Profile", href: "/profile", icon: PiUser },
    { label: "My Orders", href: "/orders", icon: PiPackage },
    { label: "Custom Orders", href: "/custom-requests", icon: PiChatsCircle },
  ],
  ADMIN: [
    { label: "Admin Dashboard", href: "/admin", icon: PiGauge },
    { label: "Products", href: "/admin/products", icon: PiFlowerTulip },
    { label: "My Profile", href: "/profile", icon: PiUser },
  ],
};

// buka/tutup pakai state (lihat useDropdown), bukan dropdown daisyUI berbasis focus,
// supaya link & tombol Log out di dalamnya bisa disentuh di HP
export function AccountMenu({ user }: { user: User }) {
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const panelId = useId();
  const { isOpen, close, toggle, containerProps } = useDropdown();

  return (
    <div className="relative" {...containerProps}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={`Account menu for ${user.name}`}
        className="flex h-11 cursor-pointer items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors duration-200 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <UserAvatar name={user.name} src={user.avatarUrl} size={36} />
        <span aria-hidden="true" className="hidden max-w-32 truncate text-sm font-semibold text-ink md:block">
          {user.name}
        </span>
        <PiCaretDown
          aria-hidden="true"
          size={14}
          className={`hidden text-ink-muted transition-transform duration-200 md:block ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          {/* lapisan transparan: sentuh di luar panel -> menu tertutup */}
          <div aria-hidden="true" onClick={close} className="fixed inset-0 z-40" />

          <div
            id={panelId}
            className="absolute right-0 top-full z-50 mt-2 w-64 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
          >
            <div className="px-3 pb-2 pt-1">
              <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-ink-muted">{user.email}</p>
              {user.role === "ADMIN" && (
                <span className="badge badge-sm mt-1.5 border-none bg-accent-soft text-accent-text">Admin</span>
              )}
            </div>

            <ul className="menu w-full border-y border-base-300 p-0 py-1">
              {ACCOUNT_LINKS[user.role].map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className="py-2.5 text-sm text-ink">
                    <Icon aria-hidden="true" size={18} className="text-ink-muted" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* logout dipisah dari menu biasa (aksi yang mengakhiri sesi) */}
            <ul className="menu w-full p-0 pt-1">
              <li>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => logout(undefined, { onSettled: close })}
                  className="py-2.5 text-sm text-danger-text hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PiSignOut aria-hidden="true" size={18} />
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
