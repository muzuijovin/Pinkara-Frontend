import type { AddonType, ProductSize } from "./product.type";

// masalah pada baris keranjang (dicek BE tiap kali keranjang dibuka)
// UNAVAILABLE = produk/varian sudah tidak dijual, OUT_OF_STOCK = stok habis,
// INSUFFICIENT_STOCK = jumlah melebihi stok, ADDON_UNAVAILABLE = add-on habis / tidak dijual
export type CartItemIssue = "UNAVAILABLE" | "OUT_OF_STOCK" | "INSUFFICIENT_STOCK" | "ADDON_UNAVAILABLE";

export type CartAddonLine = {
  id: string;
  addonId: string;
  type: AddonType;
  name: string;
  size: ProductSize | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  giftMessage: string | null;
  senderName: string | null;
  hideSender: boolean;
  isAvailable: boolean;
};

export type CartItem = {
  id: string;
  quantity: number;
  issue: CartItemIssue | null;
  product: { id: string; name: string; slug: string; image: string | null };
  variant: { id: string; label: string; price: number; stock: number; packageSize: ProductSize | null };
  addons: CartAddonLine[];
  lineTotal: number; // (harga varian x jumlah) + add-on, harga terbaru
};

// GET /cart (juga dikembalikan oleh semua aksi keranjang)
export type Cart = {
  items: CartItem[];
  summary: {
    itemCount: number; // jumlah unit produk (badge navbar)
    subtotal: number; // hanya baris tanpa masalah
    hasIssues: boolean;
  };
};

// add-on yang dikirim ke BE (POST /cart/items, PATCH /cart/items/:id)
export type CartAddonsPayload = {
  packagingId?: string | null;
  paperBagQuantity?: number | null;
  giftCard?: { message: string; senderName: string; hideSender: boolean } | null;
};
