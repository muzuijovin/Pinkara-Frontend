"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PiList } from "react-icons/pi";
import {
  CATEGORY_LINKS,
  CUSTOM_ORDER_LINK,
  MAIN_LINKS,
  closeDropdown,
  isLinkActive,
} from "../constants/navbarData";
import { SearchBar } from "./searchBar";

// menu hamburger (< lg). children = bagian akun, beda untuk tamu & user login
export function MobileMenu({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  const links = [...MAIN_LINKS, CUSTOM_ORDER_LINK];

  return (
    <div className="dropdown lg:hidden">
      <div
        tabIndex={0}
        role="button"
        aria-label="Buka menu navigasi"
        aria-haspopup="menu"
        className="btn btn-ghost btn-square size-11 text-ink"
      >
        <PiList aria-hidden="true" size={24} />
      </div>

      <div
        tabIndex={-1}
        className="dropdown-content z-50 mt-3 w-[calc(100vw-2rem)] max-w-sm rounded-box border border-base-300 bg-base-100 p-4 shadow-lg"
      >
        {/* search di header disembunyikan di bawah md, jadi dipindah ke sini */}
        <SearchBar className="md:hidden" />

        <ul className="menu mt-2 w-full p-0 text-[15px]">
          {links.map((link) => {
            const active = isLinkActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeDropdown}
                  aria-current={active ? "page" : undefined}
                  className={`py-3 ${active ? "font-semibold text-primary" : "text-ink"}`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li>
            <span className="menu-title px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Kategori Bunga
            </span>
            <ul>
              {CATEGORY_LINKS.map((category) => (
                <li key={category.href}>
                  <Link href={category.href} onClick={closeDropdown} className="py-2.5 text-ink">
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>

        {children && <div className="mt-3 border-t border-base-300 pt-3">{children}</div>}
      </div>
    </div>
  );
}
