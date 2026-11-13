"use client";

import Image from "next/image";
import { PiArrowCounterClockwise, PiCheckCircle, PiClockCountdown, PiCopySimple, PiProhibit, PiUser, PiWarningCircle } from "react-icons/pi";
import { copyText } from "@/features/(costumer)/orders/utils/payment";
import { formatRupiah } from "@/lib/currency.lib";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import type { AdminOrderDetail } from "@/types/order.type";

const CANCELLED_STATUSES = ["DIBATALKAN", "KEDALUWARSA", "PERLU_REFUND", "DIREFUND"];

// siapa yang membatalkan (atau kenapa pesanan tidak jalan)
function cancelSource(order: AdminOrderDetail) {
  if (order.status === "KEDALUWARSA") return { title: "Expired", text: "The customer didn't pay in time, so the order was cancelled automatically.", icon: PiClockCountdown };
  if (order.cancelledBy === "CUSTOMER") return { title: "Cancelled by the customer", text: null, icon: PiUser };
  if (order.cancelledBy === "SELLER" || order.status === "DIBATALKAN") return { title: "Cancelled by the seller", text: null, icon: PiProhibit };
  // PERLU_REFUND dari sistem: dibayar setelah stok habis / bayar dobel / bayar setelah dibatalkan
  return { title: "Couldn't be fulfilled", text: "The customer paid, but the order couldn't go ahead (late payment, out of stock, or paid twice).", icon: PiWarningCircle };
}

// kartu pembatalan & refund di detail pesanan admin: sumber pembatalan + alasan, nominal refund,
// rekening tujuan dari pembeli (bisa disalin), status refund & bukti transfer
export function CancellationCard({ order }: { order: AdminOrderDetail }) {
  if (!CANCELLED_STATUSES.includes(order.status)) return null;

  const source = cancelSource(order);
  const SourceIcon = source.icon;
  const needsRefund = order.status === "PERLU_REFUND";
  const refunded = order.status === "DIREFUND";
  const due = order.refundDue ?? order.total;
  const percent = Math.round((due / order.total) * 100);

  return (
    <section aria-labelledby="cancellation-title" className="card border border-danger-text/25 bg-base-100">
      <div className="card-body gap-4 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger-text">
            <SourceIcon aria-hidden="true" size={20} />
          </span>
          <div className="min-w-0">
            <h2 id="cancellation-title" className="text-lg font-semibold text-ink">
              {source.title}
            </h2>
            {order.cancelledAt && <p className="text-sm text-ink-muted">{formatDateTimeWIB(order.cancelledAt)}</p>}
            {source.text && <p className="mt-1 text-sm text-ink-muted">{source.text}</p>}
            {order.cancelReason && (
              <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-sm text-ink wrap-break-word">
                <span className="text-ink-muted">Reason: </span>
                {order.cancelReason}
              </p>
            )}
          </div>
        </div>

        {(needsRefund || refunded) && (
          <div className="flex flex-col gap-3 border-t border-base-300 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <PiArrowCounterClockwise aria-hidden="true" size={18} className="text-primary" />
                Refund
              </h3>
              {needsRefund ? (
                <span className="badge badge-sm border-none bg-danger-soft text-danger-text">Waiting to be sent</span>
              ) : (
                <span className="badge badge-sm gap-1 border-none bg-success-soft text-success-text">
                  <PiCheckCircle aria-hidden="true" size={12} />
                  Sent
                </span>
              )}
            </div>

            <dl className="grid gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-surface-muted p-3">
                <dt className="text-xs text-ink-muted">Customer paid</dt>
                <dd className="font-semibold tabular-nums text-ink">{formatRupiah(order.total)}</dd>
              </div>
              <div className="rounded-lg bg-surface-muted p-3">
                <dt className="text-xs text-ink-muted">{refunded ? "Refunded" : "To refund"}</dt>
                <dd className="font-semibold tabular-nums text-ink">{formatRupiah(refunded ? (order.refundAmount ?? 0) : due)}</dd>
              </div>
              <div className="rounded-lg bg-surface-muted p-3">
                <dt className="text-xs text-ink-muted">Rule</dt>
                <dd className="font-semibold text-ink">{percent === 100 ? "Full refund" : `${percent}% (customer cancelled)`}</dd>
              </div>
            </dl>

            {order.refundAccountNumber ? (
              <div className="flex flex-col gap-2 rounded-lg border border-base-300 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-ink">
                  <span className="block text-xs text-ink-muted">Send to</span>
                  {order.refundBankName} · <span className="font-mono font-semibold">{order.refundAccountNumber}</span>
                  <span className="block">{order.refundAccountName}</span>
                </p>
                <button
                  type="button"
                  onClick={() => copyText(order.refundAccountNumber!, "Account number")}
                  className="btn btn-outline btn-sm h-10 gap-1.5 self-start border-base-300 text-ink sm:self-center"
                >
                  <PiCopySimple aria-hidden="true" size={16} />
                  Copy number
                </button>
              </div>
            ) : (
              needsRefund && (
                <p className="flex items-start gap-2 rounded-lg bg-warning/15 p-3 text-sm text-ink">
                  <PiWarningCircle aria-hidden="true" size={18} className="mt-px shrink-0" />
                  The customer hasn&apos;t added bank details yet. They&apos;re asked to add them on their order page; you can also contact them.
                </p>
              )
            )}

            {refunded && (
              <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-start">
                {order.refundProofUrl && (
                  <a href={order.refundProofUrl} target="_blank" rel="noopener noreferrer" className="relative block h-28 w-24 shrink-0 overflow-hidden rounded-lg border border-base-300 bg-surface-muted">
                    <Image src={order.refundProofUrl} alt="Refund transfer receipt" fill sizes="96px" className="object-cover" />
                    <span className="sr-only">View refund receipt (opens in a new tab)</span>
                  </a>
                )}
                <p className="text-ink-muted">
                  {order.refundedAt && <>Sent {formatDateTimeWIB(order.refundedAt)}. </>}
                  {order.refundReason}
                  {!order.refundProofUrl && <span className="block">No receipt uploaded.</span>}
                </p>
              </div>
            )}

            {needsRefund && <p className="text-xs text-ink-muted">After transferring the money, use &quot;Mark as refunded&quot; and attach the receipt.</p>}
          </div>
        )}
      </div>
    </section>
  );
}
