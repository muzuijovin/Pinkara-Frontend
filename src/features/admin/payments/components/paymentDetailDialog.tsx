"use client";

import Link from "next/link";
import { PiArrowSquareOut, PiArrowsClockwise, PiWarningCircle } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { OrderStatusBadge } from "@/features/(costumer)/orders/constants/orderStatus";
import { formatRupiah } from "@/lib/currency.lib";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import { PaymentStatusBadge, paymentMethodLabel } from "../constants/paymentStatus";
import { useAdminPayment, useCheckPaymentStatus } from "../hooks/useAdminPayments";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right text-ink wrap-anywhere tabular-nums">{children}</dd>
    </div>
  );
}

// detail tagihan + "Check status" ke Midtrans + riwayat event webhook
export function PaymentDetailDialog({ paymentId, onClose }: { paymentId: string; onClose: () => void }) {
  const { data: payment, isPending, isError, error, refetch } = useAdminPayment(paymentId);
  const { mutate: check, isPending: isChecking } = useCheckPaymentStatus();
  const isMock = payment?.provider !== "midtrans";

  const runCheck = () =>
    check(paymentId, {
      onSuccess: (result) => {
        if (result.changed) toast.success(`Status updated: ${result.payment.status.toLowerCase()}.`);
        else if (result.gatewayMessage) toast.info(`Midtrans: ${result.gatewayMessage}`);
        else toast.info(`Already up to date${result.gatewayStatus ? ` (Midtrans: ${result.gatewayStatus})` : ""}.`);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });

  return (
    <dialog
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      onClose={onClose}
      aria-labelledby="payment-dialog-title"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="modal-box max-w-xl">
        <h3 id="payment-dialog-title" className="text-lg font-semibold text-ink">
          Payment details
        </h3>

        {isPending && <div className="skeleton mt-4 h-72 w-full" />}
        {isError && (
          <div className="mt-4 flex flex-col gap-3">
            <FormAlert message={getErrorMessage(error, "Couldn't load this payment.")} />
            <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
              Try again
            </button>
          </div>
        )}

        {payment && (
          <div className="mt-4 flex flex-col gap-5">
            {payment.attention && (
              <div role="status" className="flex items-start gap-2.5 rounded-box bg-danger-soft p-3 text-sm text-danger-text">
                <PiWarningCircle aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
                <p>
                  <span className="font-semibold">{payment.attention}.</span> Review the order and refund the buyer if needed.
                </p>
              </div>
            )}

            <dl className="divide-y divide-base-300">
              <Row label="Status">
                <PaymentStatusBadge status={payment.status} />
              </Row>
              <Row label="Order">
                <span className="inline-flex flex-wrap items-center justify-end gap-2">
                  <Link href={`/admin/orders/${payment.order.code}`} className="font-medium underline-offset-2 hover:underline">
                    {payment.order.code}
                  </Link>
                  <OrderStatusBadge status={payment.order.status} />
                </span>
              </Row>
              <Row label="Buyer">
                {payment.order.user.name}
                <span className="block text-xs text-ink-muted">{payment.order.user.email}</span>
              </Row>
              <Row label="Method">
                {paymentMethodLabel(payment.method, payment.vaBank)}
                {payment.vaNumber && <span className="block font-mono text-xs text-ink-muted">{payment.vaNumber}</span>}
              </Row>
              <Row label="Bill">{formatRupiah(payment.amount)}</Row>
              {payment.paidAmount !== null && <Row label="Received">{formatRupiah(payment.paidAmount)}</Row>}
              <Row label="Created">{formatDateTimeWIB(payment.createdAt)}</Row>
              <Row label="Pay before">{formatDateTimeWIB(payment.expiresAt)}</Row>
              {payment.paidAt && (
                <Row label="Paid at">
                  {formatDateTimeWIB(payment.paidAt)}
                  {payment.paidLate && <span className="block text-xs text-danger-text">After the time limit</span>}
                </Row>
              )}
              <Row label="Gateway">
                {isMock ? "Test (mock)" : "Midtrans"}
                <span className="block font-mono text-xs text-ink-muted">{payment.providerRef ?? payment.id}</span>
              </Row>
            </dl>

            <section aria-labelledby="payment-events-title">
              <h4 id="payment-events-title" className="text-sm font-semibold text-ink">
                Gateway events
              </h4>
              {payment.events.length === 0 ? (
                <p className="mt-1 text-sm text-ink-muted">No notifications from Midtrans yet.</p>
              ) : (
                <ol className="mt-2 flex flex-col gap-2">
                  {payment.events.map((event) => (
                    <li key={event.id} className="rounded-lg bg-surface-muted p-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-ink">{event.eventType}</span>
                        <time dateTime={event.createdAt} className="text-ink-muted tabular-nums">
                          {formatDateTimeWIB(event.createdAt)}
                        </time>
                      </div>
                      {!event.processedAt && <p className="mt-1 text-danger-text">Not processed yet</p>}
                      <details className="mt-1">
                        <summary className="cursor-pointer text-primary">Raw data</summary>
                        <pre className="mt-1 max-h-40 overflow-auto rounded bg-base-100 p-2 text-[11px] whitespace-pre-wrap text-ink-muted wrap-anywhere">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </details>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        )}

        <div className="modal-action flex-wrap">
          <form method="dialog">
            <button className="btn btn-ghost h-11 text-ink">Close</button>
          </form>
          {payment && (
            <div className="flex flex-col items-end gap-1">
              <button type="button" onClick={runCheck} disabled={isChecking || isMock} className="btn btn-primary h-11 gap-2">
                {isChecking ? <span aria-hidden="true" className="loading loading-spinner loading-sm" /> : <PiArrowsClockwise aria-hidden="true" size={18} />}
                Check status with Midtrans
              </button>
              {isMock && <span className="text-xs text-ink-muted">Test payments can&apos;t be checked.</span>}
            </div>
          )}
        </div>
        {payment && (
          <Link href={`/admin/orders/${payment.order.code}`} className="mt-3 inline-flex items-center gap-1 text-sm text-primary underline-offset-2 hover:underline">
            Open order
            <PiArrowSquareOut aria-hidden="true" size={14} />
          </Link>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close">close</button>
      </form>
    </dialog>
  );
}
