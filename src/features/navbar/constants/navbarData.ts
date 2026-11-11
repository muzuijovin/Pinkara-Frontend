export type NavLink = { label: string; href: string };

// urutan menu mengikuti header Figma (1:1866)
export const MAIN_LINKS: NavLink[] = [
  { label: "Beranda", href: "/" },
  { label: "Katalog Bunga", href: "/products" },
];

export const CUSTOM_ORDER_LINK: NavLink = { label: "Custom Order", href: "/custom-order" };

// 7 kategori dari PRD §4.1, param URL mengikuti PRD §6.2 (?kategori=bloom-box)
// sementara statis, nanti diganti useQuery kategori dari BE (kategori dikelola admin)
export const CATEGORY_LINKS: NavLink[] = [
  { label: "Round Bouquet", href: "/products?kategori=round-bouquet" },
  { label: "Bloom Box", href: "/products?kategori=bloom-box" },
  { label: "Flower Frame", href: "/products?kategori=flower-frame" },
  { label: "Flower Canvas", href: "/products?kategori=flower-canvas" },
  { label: "Hand Bouquet", href: "/products?kategori=hand-bouquet" },
  { label: "Mini Museum", href: "/products?kategori=mini-museum" },
  { label: "Keychain", href: "/products?kategori=keychain" },
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
