"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CUSTOM_ORDER_LINK, MAIN_LINKS, isLinkActive, type NavLink } from "../constants/navbarData";
import { CategoryDropdown } from "./categoryDropdown";

// menu tengah (desktop >= lg). Menu aktif: teks primary + garis bawah seperti Figma
export function DesktopNav() {
  const pathname = usePathname();

  const renderLink = ({ href, label }: NavLink) => {
    const active = isLinkActive(pathname, href);
    return (
      <li key={href}>
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={`btn btn-ghost relative h-11 px-3 text-[15px] font-medium hover:bg-transparent hover:text-primary ${
            active
              ? "text-primary after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-primary"
              : "text-ink"
          }`}
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
        {renderLink(CUSTOM_ORDER_LINK)}
      </ul>
    </nav>
  );
}
