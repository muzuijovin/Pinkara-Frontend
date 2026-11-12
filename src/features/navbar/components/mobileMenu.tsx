"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, type ReactNode } from "react";
import { PiList, PiX } from "react-icons/pi";
import type { UserRole } from "@/types/auth.type";
import { MAIN_LINKS, isLinkActive, roleLink } from "../constants/navbarData";
import { useDropdown } from "../hooks/useDropdown";
import { CategoryMenuItems } from "./categoryMenuItems";
import { SearchBar } from "./searchBar";

// menu hamburger (< lg). children = bagian akun, beda untuk tamu & user login.
// Buka/tutup pakai state (lihat useDropdown) supaya tombol & link di dalamnya bisa disentuh di HP
export function MobileMenu({ children, role }: { children?: ReactNode; role?: UserRole }) {
  const pathname = usePathname();
  const panelId = useId();
  const { isOpen, close, toggle, containerProps } = useDropdown();
  const links = [...MAIN_LINKS, roleLink(role)];

  return (
    <div className="relative lg:hidden" {...containerProps}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        className="btn btn-ghost btn-square size-11 text-ink"
      >
        {isOpen ? <PiX aria-hidden="true" size={24} /> : <PiList aria-hidden="true" size={24} />}
      </button>

      {isOpen && (
        <>
          {/* lapisan transparan: sentuh di luar panel -> menu tertutup */}
          <div aria-hidden="true" onClick={close} className="fixed inset-0 z-40" />

          <div
            id={panelId}
            className="absolute left-0 top-full z-50 mt-3 w-[calc(100vw-2rem)] max-w-sm rounded-box border border-base-300 bg-base-100 p-4 shadow-lg"
          >
            {/* search di header disembunyikan di bawah md, jadi dipindah ke sini */}
            <SearchBar className="md:hidden" />

            <nav aria-label="Mobile navigation">
              <ul className="menu mt-2 w-full p-0 text-[15px]">
                {links.map((link) => {
                  const active = isLinkActive(pathname, link.href, link.match);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={`border-l-2 py-3 text-ink ${active ? "border-primary font-semibold" : "border-transparent"}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <span className="menu-title px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Categories
                  </span>
                  <ul>
                    <CategoryMenuItems />
                  </ul>
                </li>
              </ul>
            </nav>

            {children && <div className="mt-3 border-t border-base-300 pt-3">{children}</div>}
          </div>
        </>
      )}
    </div>
  );
}
