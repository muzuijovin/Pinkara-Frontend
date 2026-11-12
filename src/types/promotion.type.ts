// GET /promotions/active -> promo "5 pembeli pertama" untuk banner landing (null = tidak ada / kuota habis)
export type ActivePromotion = {
  name: string;
  discountType: "PERCENTAGE" | "FIXED";
  value: number; // persen (mis. 10) atau rupiah
  maxDiscount: number | null;
  appliesTo: "READY" | "CUSTOM" | null;
  quota: number;
  remaining: number;
};

// GET /gallery -> foto hasil karya
export type GalleryItem = { id: string; imageUrl: string; caption: string | null };
