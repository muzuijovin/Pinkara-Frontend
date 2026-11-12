// Foto kategori untuk landing page, dipakai selama kategori belum punya imageUrl dari admin.
// Semua dari Unsplash (Unsplash License: gratis termasuk komersial, tanpa wajib atribusi),
// diunduh & dioptimalkan ke WebP 720x900 di public/images/categories.
//   round-bouquet  -> Jessie Daniella      (unsplash.com/photos/QLuleNy8LMM)
//   bloom-box      -> Nika Benedictova     (unsplash.com/photos/nkJbrWFHPNc)
//   flower-frame   -> Evie S.              (unsplash.com/photos/9wpLwUm4KOo)
//   flower-canvas  -> Evie S.              (unsplash.com/photos/86EmBuYd8wk)
//   hand-bouquet   -> Grigorii Shcheglov   (unsplash.com/photos/vr8kXY3KWM8)
//   mini-museum    -> Zihao Wang           (unsplash.com/photos/JyCbKqSFEm0)
// keychain belum ada foto yang cocok -> tampilan cadangan (ikon)
export const CATEGORY_IMAGES: Record<string, string> = {
  "round-bouquet": "/images/categories/round-bouquet.webp",
  "bloom-box": "/images/categories/bloom-box.webp",
  "flower-frame": "/images/categories/flower-frame.webp",
  "flower-canvas": "/images/categories/flower-canvas.webp",
  "hand-bouquet": "/images/categories/hand-bouquet.webp",
  "mini-museum": "/images/categories/mini-museum.webp",
};

export const categoryImage = (slug: string, imageUrl: string | null) => imageUrl ?? CATEGORY_IMAGES[slug] ?? null;
