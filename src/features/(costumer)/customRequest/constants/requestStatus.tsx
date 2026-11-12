import type { CustomRequestStatus, QuotationStatus } from "@/types/customRequest.type";

// label & warna status request custom (status BE tetap bahasa Indonesia, PRD §11)
export const REQUEST_STATUS: Record<CustomRequestStatus, { label: string; className: string }> = {
  DISKUSI: { label: "In discussion", className: "bg-info-soft text-ink" },
  PENAWARAN_DIKIRIM: { label: "Quote received", className: "bg-warning/20 text-ink" },
  DISETUJUI: { label: "Accepted", className: "bg-success-soft text-success-text" },
  DIBATALKAN: { label: "Cancelled", className: "bg-surface-sunken text-ink-muted" },
};

export const QUOTATION_STATUS: Record<QuotationStatus, string> = {
  ACTIVE: "Waiting for your answer",
  ACCEPTED: "Accepted",
  REJECTED: "Declined",
  SUPERSEDED: "Replaced by a newer quote",
  EXPIRED: "Expired",
};

export function RequestStatusBadge({ status }: { status: CustomRequestStatus }) {
  const { label, className } = REQUEST_STATUS[status];
  return <span className={`badge badge-sm shrink-0 border-none font-medium ${className}`}>{label}</span>;
}
