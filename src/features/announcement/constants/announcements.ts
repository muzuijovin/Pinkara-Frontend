// ===== ISI BAR PENGUMUMAN (di bawah navbar, halaman publik & customer) =====
// Tambah / ubah / hapus item di sini. href opsional: kalau diisi, teksnya jadi link.
// Kosongkan array = bar otomatis disembunyikan.

export type Announcement = { text: string; href?: string };

export const ANNOUNCEMENTS: Announcement[] = [
  { text: "Shipping across Indonesia from our studio in Malang", href: "/products" },
  { text: "Free pick-up at our studio in Malang" },
  { text: "Want something unique? Order a custom bouquet and chat with our florist", href: "/custom-order" },
  { text: "Pay instantly with QRIS or a bank virtual account" },
  { text: "Add a gift card, box or paper bag to any bouquet", href: "/products" },
];
