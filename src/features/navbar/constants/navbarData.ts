export type NavLink = { label: string; href: string };

// urutan menu mengikuti header Figma (1:1866)
export const MAIN_LINKS: NavLink[] = [
  { label: "Beranda", href: "/" },
  { label: "Katalog Bunga", href: "/products" },
];

export const CUSTOM_ORDER_LINK: NavLink = { label: "Custom Order", href: "/custom-order" };

// sementara statis, nanti diganti useQuery kategori dari BE
export const CATEGORY_LINKS: NavLink[] = [
  { label: "Buket Bunga", href: "/products?category=buket-bunga" },
  { label: "Hampers", href: "/products?category=hampers" },
  { label: "Anggrek", href: "/products?category=anggrek" },
  { label: "Bunga Papan", href: "/products?category=bunga-papan" },
  { label: "Standing Flower", href: "/products?category=standing-flower" },
];

// "/" hanya aktif di beranda, menu lain aktif juga di sub-halamannya
export const isLinkActive = (pathname: string, href: string) => {
  const path = href.split("?")[0];
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
};

// dropdown DaisyUI berbasis focus -> blur supaya menu tertutup setelah link diklik
export const closeDropdown = () => {
  (document.activeElement as HTMLElement | null)?.blur();
};
