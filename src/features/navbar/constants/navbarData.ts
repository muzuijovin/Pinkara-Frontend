import type { UserRole } from "@/types/auth.type";

// match = awalan path yang membuat menu aktif (default: href)
export type NavLink = { label: string; href: string; match?: string };

// urutan menu mengikuti header Figma (1:1866)
export const MAIN_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Catalog", href: "/products" },
];

export const CUSTOM_ORDER_LINK: NavLink = { label: "Custom Order", href: "/custom-order" };

// admin tidak memesan custom -> menu ke panel admin (dashboard belum ada, jadi langsung ke Orders)
export const ADMIN_PANEL_LINK: NavLink = { label: "Admin panel", href: "/admin/orders", match: "/admin" };

// menu terakhir sesuai peran: tamu & customer -> Custom Order, admin -> Admin panel
export const roleLink = (role?: UserRole) => (role === "ADMIN" ? ADMIN_PANEL_LINK : CUSTOM_ORDER_LINK);

// "/" hanya aktif di beranda, menu lain aktif juga di sub-halamannya
export const isLinkActive = (pathname: string, href: string, match?: string) => {
  const path = match ?? href.split("?")[0];
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
};

// style menu desktop: tanpa latar & tanpa ganti warna teks.
// Aktif = garis primary di bawah; hover = garis abu tipis sebagai tanda bisa diklik
export const navItemClass = (active: boolean) =>
  `relative inline-flex h-11 cursor-pointer items-center gap-1 rounded-md px-3 text-[15px] font-medium text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:transition-colors after:duration-200 ${
    active ? "after:bg-primary" : "after:bg-transparent hover:after:bg-base-300"
  }`;

