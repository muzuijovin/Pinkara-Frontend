"use client";

import Link from "next/link";
import { PiCaretDown } from "react-icons/pi";
import { CATEGORY_LINKS, closeDropdown } from "../constants/navbarData";

// dropdown DaisyUI (focus-based): tertutup otomatis saat klik di luar / Esc / pilih kategori
export function CategoryDropdown() {
  return (
    <div className="dropdown dropdown-center">
      <div
        tabIndex={0}
        role="button"
        aria-haspopup="menu"
        className="btn btn-ghost h-11 gap-1 px-3 text-[15px] font-medium text-ink hover:bg-transparent hover:text-primary"
      >
        Kategori Bunga
        <PiCaretDown aria-hidden="true" size={14} />
      </div>
      <ul
        tabIndex={-1}
        className="menu dropdown-content z-50 mt-2 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
      >
        {CATEGORY_LINKS.map((category) => (
          <li key={category.href}>
            <Link href={category.href} onClick={closeDropdown} className="py-2.5 text-ink">
              {category.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
