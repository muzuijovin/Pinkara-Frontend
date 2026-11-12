"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/types/auth.type";
import { MAIN_LINKS, isLinkActive, navItemClass, roleLink, type NavLink } from "../constants/navbarData";
import { CategoryDropdown } from "./categoryDropdown";

// menu tengah (desktop >= lg). Menu aktif: cukup garis primary di bawah, warna teks tetap
export function DesktopNav({ role }: { role?: UserRole }) {
  const pathname = usePathname();

  const renderLink = ({ href, label, match }: NavLink) => {
    const active = isLinkActive(pathname, href, match);
    return (
      <li key={href}>
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={navItemClass(active)}
        >
          {label}
        </Link>
      </li>
    );
  };

  return (
    <nav aria-label="Navigasi utama" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {MAIN_LINKS.map(renderLink)}
        <li>
          <CategoryDropdown />
        </li>
        {renderLink(roleLink(role))}
      </ul>
    </nav>
  );
}
