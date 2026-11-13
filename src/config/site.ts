// ===== DATA STUDIO (dipakai footer, About, Privacy Policy) =====
// GANTI nilai bertanda PLACEHOLDER dengan data asli Pinkara sebelum rilis.

export const SITE = {
  name: "Pinkara Studio",
  city: "Malang, East Java",
  // alamat studio untuk ambil sendiri (PLACEHOLDER)
  address: "Malang, East Java, Indonesia",

  // Instagram: username tanpa @ (PLACEHOLDER)
  instagram: "pinkara.studio",
  // WhatsApp: format internasional tanpa + / spasi, mis. 6281234567890 (PLACEHOLDER)
  whatsapp: "6281234567890",
  // email untuk pertanyaan pelanggan (PLACEHOLDER)
  email: "hello@pinkara.id",

  // jam buka studio (WIB)
  hours: [
    { day: "Mon – Sat", time: "08:00 – 20:00" },
    { day: "Sunday", time: "09:00 – 17:00" },
  ],
} as const;

export const instagramUrl = `https://instagram.com/${SITE.instagram}`;
export const whatsappUrl = `https://wa.me/${SITE.whatsapp}`;
export const emailUrl = `mailto:${SITE.email}`;

// 0812-3456-7890 untuk ditampilkan (dari 6281234567890)
export const whatsappDisplay = `0${SITE.whatsapp.replace(/^62/, "")}`.replace(/^(\d{4})(\d{4})(\d+)$/, "$1-$2-$3");

// logo metode bayar & kurir yang benar-benar didukung (sama dengan checkout).
// File di public/images/brands, sumber Wikimedia Commons (public domain / CC0, kecuali JNE: CC BY-SA 4.0 oleh Artosaary).
// width/height = rasio asli logo, ditampilkan setinggi 20px
export type BrandLogo = { name: string; src: string; width: number; height: number };

export const PAYMENT_METHODS: BrandLogo[] = [
  { name: "QRIS", src: "/images/brands/qris.svg", width: 124, height: 20 },
  { name: "BCA", src: "/images/brands/bca.svg", width: 64, height: 20 },
  { name: "BNI", src: "/images/brands/bni.svg", width: 69, height: 20 },
  { name: "BRI", src: "/images/brands/bri.svg", width: 85, height: 20 },
  { name: "Permata Bank", src: "/images/brands/permata.svg", width: 81, height: 20 },
];

export const SHIPPING_PARTNERS: BrandLogo[] = [
  { name: "JNE", src: "/images/brands/jne.webp", width: 50, height: 20 },
  { name: "J&T Express", src: "/images/brands/jnt.svg", width: 96, height: 20 },
  { name: "GoSend by Gojek", src: "/images/brands/gojek.svg", width: 70, height: 20 },
  { name: "GrabExpress", src: "/images/brands/grab.svg", width: 56, height: 20 },
];
