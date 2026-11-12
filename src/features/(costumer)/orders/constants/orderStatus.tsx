import type { OrderStatus } from "@/types/order.type";

// label & warna badge status pesanan (status di BE tetap bahasa Indonesia, PRD §11)
export const ORDER_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  MENUNGGU_PEMBAYARAN: { label: "Awaiting payment", className: "bg-warning/20 text-ink" },
  DIBAYAR: { label: "Paid", className: "bg-info-soft text-ink" },
  DIKEMAS: { label: "Packing", className: "bg-info-soft text-ink" },
  DIPRODUKSI: { label: "In production", className: "bg-info-soft text-ink" },
  SIAP_KIRIM: { label: "Ready to ship", className: "bg-info-soft text-ink" },
  DIKIRIM: { label: "Shipped", className: "bg-accent-soft text-accent-text" },
  SELESAI: { label: "Completed", className: "bg-success-soft text-success-text" },
  KEDALUWARSA: { label: "Expired", className: "bg-surface-sunken text-ink-muted" },
  DIBATALKAN: { label: "Cancelled", className: "bg-danger-soft text-danger-text" },
  PERLU_REFUND: { label: "Refund in progress", className: "bg-danger-soft text-danger-text" },
  DIREFUND: { label: "Refunded", className: "bg-surface-sunken text-ink-muted" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = ORDER_STATUS[status];
  return <span className={`badge badge-sm shrink-0 border-none font-medium ${className}`}>{label}</span>;
}
