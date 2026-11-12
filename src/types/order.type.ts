import type { AddonType, ProductSize } from "./product.type";

export type ShippingMethod = "COURIER" | "PICKUP";
export type PaymentMethod = "QRIS" | "VIRTUAL_ACCOUNT" | "MANUAL_TRANSFER";
export type OrderStatus =
  | "MENUNGGU_PEMBAYARAN"
  | "DIBAYAR"
  | "DIKEMAS"
  | "DIPRODUKSI"
  | "SIAP_KIRIM"
  | "DIKIRIM"
  | "SELESAI"
  | "KEDALUWARSA"
  | "DIBATALKAN"
  | "PERLU_REFUND"
  | "DIREFUND";

// kode error checkout dari BE (response.data.data.code)
// PRICE_CHANGED = total berubah (harga / promo), CART_CHANGED = stok / produk berubah,
// CHECKOUT_BUSY = server sibuk (aman diulang dengan idempotency key yang sama)
export type CheckoutErrorCode = "PRICE_CHANGED" | "CART_CHANGED" | "CART_EMPTY" | "ADDRESS_NOT_FOUND" | "CHECKOUT_BUSY";

export type PaymentStatus =
  | "PENDING"
  | "WAITING_VERIFICATION"
  | "PAID"
  | "UNDERPAID"
  | "OVERPAID"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";
export type VaBank = "bca" | "bni" | "bri" | "permata";

// tagihan aktif terakhir pada order (QR / nomor VA dari gateway)
export type OrderPayment = {
  id: string;
  method: PaymentMethod;
  provider: "midtrans" | "mock" | null; // mock = mode tes lokal (ada tombol simulasi bayar)
  status: PaymentStatus;
  qrString: string | null;
  vaNumber: string | null;
  vaBank: VaBank | null;
  amount: number;
  expiresAt: string;
  paidAt: string | null;
};

export type OrderLineAddon = {
  name: string;
  type: AddonType;
  size: ProductSize | null;
  unitPrice: number;
  quantity: number;
  giftMessage: string | null;
  senderName: string | null;
  hideSender: boolean;
};

// GET /orders/checkout -> ringkasan sebelum "Place order" (harga terbaru dari keranjang)
export type CheckoutPreview = {
  items: {
    productName: string;
    variantLabel: string;
    imageUrl: string | null;
    unitPrice: number;
    quantity: number;
    addonTotal: number;
    lineTotal: number;
    addons: (OrderLineAddon & { addonId: string })[];
  }[];
  subtotal: number; // harga produk saja
  addonTotal: number;
  promo: { name: string; discount: number; remaining: number } | null; // null = tidak berhak / kuota habis
  shippingOptions: { method: ShippingMethod; fee: number }[];
  paymentOptions: { method: PaymentMethod; expiresInMinutes: number }[];
};

// GET /orders/:code (juga response POST /orders)
export type OrderDetail = {
  code: string;
  type: "READY" | "CUSTOM";
  status: OrderStatus;
  subtotal: number;
  addonTotal: number;
  discount: number;
  shippingFee: number;
  uniqueCode: number;
  total: number;
  paymentMethod: PaymentMethod | null;
  shippingMethod: ShippingMethod;
  shipRecipientName: string | null;
  shipRecipientPhone: string | null;
  shipFullAddress: string | null;
  shipCity: string | null;
  shipPostalCode: string | null;
  courier: string | null;
  trackingNo: string | null;
  buyerNote: string | null;
  expiresAt: string;
  paidAt: string | null;
  createdAt: string;
  serverTime: string; // jam server, untuk hitung mundur yang akurat
  promotionName: string | null;
  payment: OrderPayment | null;
  items: {
    id: string;
    productName: string;
    productSlug: string | null;
    variantLabel: string | null;
    imageUrl: string | null;
    unitPrice: number;
    quantity: number;
    addonTotal: number;
    lineTotal: number;
    addons: (OrderLineAddon & { id: string })[];
  }[];
  statusHistory: { toStatus: OrderStatus; remark: string | null; createdAt: string }[];
};
