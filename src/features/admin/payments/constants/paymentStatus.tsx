import type { PaymentMethod, PaymentStatus, VaBank } from "@/types/order.type";

// label & warna badge status tagihan (teks selalu ada, tidak hanya warna)
export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-warning/20 text-ink" },
  WAITING_VERIFICATION: { label: "Waiting verification", className: "bg-warning/20 text-ink" },
  PAID: { label: "Paid", className: "bg-success-soft text-success-text" },
  UNDERPAID: { label: "Underpaid", className: "bg-danger-soft text-danger-text" },
  OVERPAID: { label: "Overpaid", className: "bg-danger-soft text-danger-text" },
  REJECTED: { label: "Rejected", className: "bg-danger-soft text-danger-text" },
  EXPIRED: { label: "Expired", className: "bg-surface-sunken text-ink-muted" },
  CANCELLED: { label: "Cancelled", className: "bg-surface-sunken text-ink-muted" },
};

// tab status di halaman pemantauan (WAITING_VERIFICATION / REJECTED hanya untuk transfer manual -> tidak dipakai)
export const PAYMENT_STATUS_TABS: PaymentStatus[] = ["PENDING", "PAID", "UNDERPAID", "OVERPAID", "EXPIRED", "CANCELLED"];

export const isPaymentStatus = (value: string | null): value is PaymentStatus => Boolean(value && value in PAYMENT_STATUS);

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, className } = PAYMENT_STATUS[status];
  return <span className={`badge badge-sm shrink-0 border-none font-medium ${className}`}>{label}</span>;
}

// "QRIS" / "BCA Virtual Account"
export function paymentMethodLabel(method: PaymentMethod, vaBank: VaBank | null) {
  if (method === "QRIS") return "QRIS";
  if (method === "VIRTUAL_ACCOUNT") return vaBank ? `${vaBank.toUpperCase()} Virtual Account` : "Virtual Account";
  return "Bank transfer";
}
