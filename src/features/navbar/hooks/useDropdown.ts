import { useState, type KeyboardEvent, type MouseEvent } from "react";

// Dropdown yang buka/tutupnya dikontrol state (bukan dropdown daisyUI berbasis :focus-within).
// Kenapa: di browser HP (terutama Safari iOS) menyentuh <a> tidak memberi focus, jadi dropdown
// berbasis focus sudah tertutup sebelum klik tercatat -> sentuhan jatuh ke halaman di belakangnya
// (mis. tombol "Log in" di menu HP malah tidak membuka /login).
export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    close,
    toggle: () => setIsOpen((open) => !open),
    // dipasang di elemen pembungkus dropdown
    containerProps: {
      // Esc menutup menu
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === "Escape" && isOpen) {
          event.stopPropagation();
          close();
        }
      },
      // link / saran pencarian diklik -> menu ditutup (navigasinya tetap jalan)
      onClick: (event: MouseEvent<HTMLElement>) => {
        if ((event.target as HTMLElement).closest("a[href], [role='option']")) close();
      },
      // search di dalam menu di-submit (Enter) -> tutup juga
      onSubmit: close,
    },
  };
}
