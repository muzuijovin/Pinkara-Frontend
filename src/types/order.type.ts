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

// foto progres pesanan custom yang diunggah admin (PRD §8 no. 6)
export type ProgressPhoto = { url: string; caption: string | null; uploadedAt: string };

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
  progressPhotos: ProgressPhoto[]; // khusus pesanan custom
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

// tab di halaman Pesanan Saya
export type OrderTab = "active" | "completed" | "cancelled";

// 1 kartu di GET /orders
export type OrderListItem = {
  code: string;
  type: "READY" | "CUSTOM";
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod | null;
  shippingMethod: ShippingMethod;
  expiresAt: string;
  createdAt: string;
  itemCount: number; // jumlah unit produk
  firstItem: { productName: string; variantLabel: string | null; imageUrl: string | null; quantity: number } | null;
  otherProducts: number; // jumlah produk lain selain firstItem
};

// ===== ADMIN =====

// 1 baris di GET /admin/orders
export type AdminOrderListItem = Omit<OrderListItem, "firstItem"> & {
  paidAt: string | null;
  user: { name: string; email: string };
  firstItem: { productName: string; imageUrl: string | null; quantity: number } | null;
};

export type AdminOrderStatusCounts = Partial<Record<OrderStatus, number>>;

// GET /admin/orders/:code (+ semua aksi admin)
export type AdminOrderDetail = Omit<OrderDetail, "serverTime" | "payment" | "items" | "statusHistory"> & {
  shippedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  refundedAt: string | null;
  user: { name: string; email: string; phone: string | null };
  items: (Omit<OrderDetail["items"][number], "productSlug" | "addons"> & {
    addons: (OrderLineAddon & { id: string; packedAt: string | null })[];
  })[];
  payments: {
    method: PaymentMethod;
    provider: string | null;
    status: PaymentStatus;
    amount: number;
    paidAmount: number | null;
    vaBank: VaBank | null;
    paidAt: string | null;
    createdAt: string;
  }[];
  statusHistory: { toStatus: OrderStatus; remark: string | null; createdAt: string; actor: { name: string; role: "ADMIN" | "CUSTOMER" } | null }[];
  allowedNextStatuses: OrderStatus[];
  canCancel: boolean;
  canRefund: boolean;
  canPack: boolean;
};
