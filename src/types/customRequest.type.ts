import type { AddonType, ProductSize } from "./product.type";
import type { OrderStatus, PaymentMethod, ShippingMethod } from "./order.type";

export type CustomRequestStatus = "DISKUSI" | "PENAWARAN_DIKIRIM" | "DISETUJUI" | "DIBATALKAN";
export type QuotationStatus = "ACTIVE" | "ACCEPTED" | "REJECTED" | "SUPERSEDED" | "EXPIRED";

export type CustomBrief = {
  size: string;
  colors: string;
  flowers: string;
  cardMessage: string | null;
  notes: string | null;
  budget: number | null;
};

export type QuotationItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  addons: { addonId: string; name: string; type: AddonType; size: ProductSize | null; unitPrice: number; quantity: number; giftMessage?: string }[];
};

export type Quotation = {
  id: string;
  items: QuotationItem[];
  subtotal: number;
  addonTotal: number;
  total: number;
  readyDate: string; // yyyy-MM-dd
  notes: string | null;
  validUntil: string;
  status: QuotationStatus;
  version: number; // dikirim saat "Accept & pay" (optimistic locking)
  createdAt: string;
  order: { code: string; status: OrderStatus } | null;
};

export type CustomMessage = {
  id: string;
  body: string | null;
  attachments: string[];
  readAt: string | null;
  createdAt: string;
  mine: boolean;
  sender: { name: string; role: "ADMIN" | "CUSTOMER"; avatarUrl: string | null };
};

// GET /custom-requests/:code (pembeli) & /admin/custom-requests/:code (admin: + customer)
export type CustomRequestDetail = {
  code: string;
  status: CustomRequestStatus;
  brief: CustomBrief;
  referenceImages: string[];
  neededBy: string; // yyyy-MM-dd
  createdAt: string;
  updatedAt: string;
  product: { name: string; slug: string; images: string[]; basePrice: number | null } | null;
  category: { name: string; slug: string } | null;
  customer?: { name: string; email: string; phone: string | null };
  messages: CustomMessage[];
  quotations: Quotation[]; // terbaru dulu
  serverTime: string;
  shippingOptions: { method: ShippingMethod; fee: number }[];
  paymentOptions: { method: PaymentMethod; expiresInMinutes: number }[];
};

// 1 kartu di GET /custom-requests & /admin/custom-requests
export type CustomRequestListItem = {
  code: string;
  status: CustomRequestStatus;
  brief: CustomBrief;
  referenceImages: string[];
  neededBy: string;
  createdAt: string;
  updatedAt: string;
  product: { name: string; images: string[] } | null;
  category: { name: string } | null;
  latestQuotation: { status: QuotationStatus; total: number; validUntil: string } | null;
  unreadCount: number;
  // admin saja
  user?: { name: string; email: string };
  needsReply?: boolean;
  lastBuyerMessageAt?: string | null;
};

// GET /addons (form penawaran admin)
export type AddonOption = { id: string; name: string; type: AddonType; size: ProductSize | null; price: number; stock: number };
