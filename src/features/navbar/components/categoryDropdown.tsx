"use client";

import { PiCaretDown } from "react-icons/pi";
import { navItemClass } from "../constants/navbarData";
import { CategoryMenuItems } from "./categoryMenuItems";

// dropdown DaisyUI (focus-based): tertutup otomatis saat klik di luar / Esc / pilih kategori
// isi kategori diambil dari BE (GET /categories)
export function CategoryDropdown() {
  return (
    <div className="dropdown dropdown-center">
      <div tabIndex={0} role="button" aria-haspopup="menu" className={navItemClass(false)}>
        Categories
        <PiCaretDown aria-hidden="true" size={14} />
      </div>
      <ul
        tabIndex={-1}
        className="menu dropdown-content z-50 mt-2 max-h-96 w-60 flex-nowrap overflow-y-auto rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
      >
        <CategoryMenuItems />
      </ul>
    </div>
  );
}
