"use client";

import { useId } from "react";
import { PiCaretDown } from "react-icons/pi";
import { navItemClass } from "../constants/navbarData";
import { useDropdown } from "../hooks/useDropdown";
import { CategoryMenuItems } from "./categoryMenuItems";

// dropdown kategori (desktop >= lg, termasuk tablet layar lebar).
// Buka/tutup pakai state (lihat useDropdown) supaya link bisa disentuh di perangkat sentuh.
// isi kategori diambil dari BE (GET /categories)
export function CategoryDropdown() {
  const panelId = useId();
  const { isOpen, close, toggle, containerProps } = useDropdown();

  return (
    <div className="relative" {...containerProps}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={navItemClass(false)}
      >
        Categories
        <PiCaretDown
          aria-hidden="true"
          size={14}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          {/* lapisan transparan: klik / sentuh di luar panel -> menu tertutup */}
          <div aria-hidden="true" onClick={close} className="fixed inset-0 z-40" />
          <ul
            id={panelId}
            className="menu absolute left-1/2 top-full z-50 mt-2 max-h-96 w-60 -translate-x-1/2 flex-nowrap overflow-y-auto rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
          >
            <CategoryMenuItems />
          </ul>
        </>
      )}
    </div>
  );
}
