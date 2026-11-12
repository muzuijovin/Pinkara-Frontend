import type { PaginationMeta } from "./api-response.type";
import type { OrderStatus, PaymentMethod, PaymentStatus, VaBank } from "./order.type";

// 1 tagihan di halaman pemantauan transaksi (GET /admin/payments)
export type AdminPayment = {
  id: string;
  method: PaymentMethod;
  vaBank: VaBank | null;
  provider: string | null; // "midtrans" / "mock"
  amount: number;
  paidAmount: number | null;
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
  expiresAt: string;
  paidLate: boolean;
  attention: string | null; // alasan perlu dicek admin, null = aman
  order: { code: string; status: OrderStatus; total: number; user: { name: string; email: string } };
};

export type PaymentEvent = {
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  processedAt: string | null;
  createdAt: string;
};

export type AdminPaymentDetail = AdminPayment & {
  providerRef: string | null;
  vaNumber: string | null;
  updatedAt: string;
  events: PaymentEvent[];
};

export type AdminPaymentsMeta = PaginationMeta & {
  totalPayments: number;
  statusCounts: Partial<Record<PaymentStatus, number>>;
  attentionCount: number;
};

export type AdminPaymentsParams = {
  page: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
  attention?: boolean;
  search?: string;
  from?: string;
  to?: string;
};

export type PaymentCheckResult = {
  gatewayStatus: string | null;
  gatewayMessage: string | null;
  changed: boolean;
  payment: AdminPaymentDetail;
};
