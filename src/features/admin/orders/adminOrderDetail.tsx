"use client";

import { isAxiosError } from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PiCaretRight, PiMapPin, PiReceipt } from "react-icons/pi";
import { FormAlert } from "@/components/form/formAlert";
import { PageLoader } from "@/components/ui/pageLoader";
import { ORDER_STATUS, OrderStatusBadge } from "@/features/(costumer)/orders/constants/orderStatus";
import { formatRupiah } from "@/lib/currency.lib";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { AdminOrderDetail as AdminOrderDetailData, PaymentStatus } from "@/types/order.type";
import { CancellationCard } from "./components/cancellationCard";
import { OrderActions } from "./components/orderActions";
import { PackingWorksheet } from "./components/packingWorksheet";
import { ProgressPhotos } from "./components/progressPhotos";
import { useAdminOrder } from "./hooks/useAdminOrders";

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Waiting",
  WAITING_VERIFICATION: "Needs verification",
  PAID: "Paid",
  UNDERPAID: "Underpaid",
  OVERPAID: "Overpaid",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  CANCELLED: "Replaced",
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card border border-base-300 bg-base-100">
      <div className="card-body gap-3 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function Row({ label, value, className = "" }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={`text-right tabular-nums text-ink ${className}`}>{value}</dd>
    </div>
  );
}

function CustomerAndShipping({ order }: { order: AdminOrderDetailData }) {
  return (
    <Card title="Customer & delivery">
      <div className="text-sm">
        <p className="font-semibold text-ink">{order.user.name}</p>
        <p className="text-ink-muted">{order.user.email}</p>
        {order.user.phone && <p className="text-ink-muted">{order.user.phone}</p>}
      </div>
      <div className="border-t border-base-300 pt-3 text-sm">
        <p className="font-semibold text-ink">{order.shippingMethod === "PICKUP" ? "Pick up at studio" : "Deliver to"}</p>
        {order.shippingMethod === "COURIER" && (
          <p className="mt-1 text-ink-muted">
            {order.shipRecipientName} · {order.shipRecipientPhone}
            <br />
            {order.shipFullAddress}, {order.shipCity} {order.shipPostalCode}
          </p>
        )}
        {order.shipServiceName && (
          <p className="mt-2 text-ink">
            <span className="font-medium">{order.shipServiceName}</span>
            {order.shipEta && <span className="text-ink-muted"> · estimated {order.shipEta.toLowerCase()}</span>}
          </p>
        )}
        {order.shipLatitude !== null && order.shipLongitude !== null && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${order.shipLatitude},${order.shipLongitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-accent-text underline-offset-2 hover:underline"
          >
            <PiMapPin aria-hidden="true" size={14} />
            Open pinned location in Google Maps
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
        {order.trackingNo && (
          <p className="mt-2 text-ink">
            {order.courier}: <span className="font-mono font-semibold">{order.trackingNo}</span>
          </p>
        )}
        {order.buyerNote && (
          <p className="mt-2 rounded-lg bg-warning/15 px-3 py-2 text-ink wrap-break-word">Note: {order.buyerNote}</p>
        )}
      </div>
    </Card>
  );
}

function PaymentSummary({ order }: { order: AdminOrderDetailData }) {
  return (
    <Card title="Payment">
      <dl className="flex flex-col gap-1.5">
        <Row label="Products" value={formatRupiah(order.subtotal)} />
        {order.addonTotal > 0 && <Row label="Add-ons" value={formatRupiah(order.addonTotal)} />}
        {order.discount > 0 && (
          <Row label={order.promotionName ?? "Promo"} value={`−${formatRupiah(order.discount)}`} className="text-success-text" />
        )}
        <Row label="Shipping" value={order.shippingFee ? formatRupiah(order.shippingFee) : "Free"} />
        {order.uniqueCode > 0 && <Row label="Unique code" value={formatRupiah(order.uniqueCode)} />}
        <div className="mt-1 flex justify-between gap-3 border-t border-base-300 pt-2 font-semibold">
          <dt className="text-ink">Total</dt>
          <dd className="tabular-nums text-ink">{formatRupiah(order.total)}</dd>
        </div>
        {order.refundAmount !== null && (
          <Row label="Refunded" value={formatRupiah(order.refundAmount)} className="text-danger-text" />
        )}
      </dl>

      {order.payments.length > 0 && (
        <ul className="flex flex-col gap-2 border-t border-base-300 pt-3 text-sm">
          {order.payments.map((payment) => (
            <li key={payment.createdAt} className="flex justify-between gap-3">
              <span className="text-ink">
                {payment.method === "QRIS" ? "QRIS" : payment.method === "VIRTUAL_ACCOUNT" ? `VA ${payment.vaBank?.toUpperCase() ?? ""}` : "Transfer"}
                {payment.provider === "mock" && <span className="text-ink-muted"> (test)</span>}
                <span className="block text-xs text-ink-muted">
                  {payment.paidAt ? `Paid ${formatDateTimeWIB(payment.paidAt)}` : formatDateTimeWIB(payment.createdAt)}
                </span>
              </span>
              <span className={payment.status === "PAID" ? "font-medium text-success-text" : "text-ink-muted"}>
                {PAYMENT_STATUS_LABEL[payment.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function History({ order }: { order: AdminOrderDetailData }) {
  const entries = [...order.statusHistory].reverse();
  return (
    <Card title="History">
      <ol className="flex flex-col">
        {entries.map((entry, index) => (
          <li key={`${entry.toStatus}-${entry.createdAt}`} className="relative flex gap-3 pb-4 last:pb-0">
            {index < entries.length - 1 && <span aria-hidden="true" className="absolute left-1.25 top-4 h-full w-px bg-base-300" />}
            <span aria-hidden="true" className={`relative mt-1.5 size-2.75 shrink-0 rounded-full ${index === 0 ? "bg-primary" : "bg-base-300"}`} />
            <div className="min-w-0 text-sm">
              <p className={index === 0 ? "font-semibold text-ink" : "text-ink"}>{ORDER_STATUS[entry.toStatus].label}</p>
              {entry.remark && <p className="text-xs text-ink-muted wrap-break-word">{entry.remark}</p>}
              <p className="text-xs text-ink-muted">
                {formatDateTimeWIB(entry.createdAt)} · {entry.actor ? `${entry.actor.name}${entry.actor.role === "ADMIN" ? " (admin)" : ""}` : "System"}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

// detail pesanan admin (PRD §12): aksi sesuai state machine, lembar kerja pengemasan, pembeli & pengiriman,
// pembayaran, riwayat status
export function AdminOrderDetail() {
  const { code } = useParams<{ code: string }>();
  const { data: order, isPending, isError, error, refetch } = useAdminOrder(code);

  if (isPending) return <PageLoader />;

  if (isError) {
    const isNotFound = isAxiosError(error) && error.response?.status === 404;
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <PiReceipt aria-hidden="true" size={44} className="text-ink-muted" />
        {isNotFound ? (
          <h1 className="text-xl font-semibold text-ink">Order not found</h1>
        ) : (
          <>
            <FormAlert message={getErrorMessage(error, "Couldn't load this order.")} />
            <button type="button" onClick={() => refetch()} className="btn btn-outline h-11">
              Try again
            </button>
          </>
        )}
        <Link href="/admin/orders" className="btn btn-primary h-11">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-sm text-ink-muted">
        <Link href="/admin/orders" className="rounded hover:text-ink hover:underline">
          Orders
        </Link>
        <PiCaretRight aria-hidden="true" size={12} />
        <span aria-current="page" className="font-mono text-ink">
          {order.code}
        </span>
      </nav>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-bold text-ink md:text-3xl">{order.code}</h1>
        <OrderStatusBadge status={order.status} />
        {order.type === "CUSTOM" && <span className="badge badge-sm border-none bg-accent-soft text-accent-text">Custom</span>}
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        Placed {formatDateTimeWIB(order.createdAt)}
        {order.paidAt && ` · Paid ${formatDateTimeWIB(order.paidAt)}`}
        {order.status === "MENUNGGU_PEMBAYARAN" && ` · Pay before ${formatDateTimeWIB(order.expiresAt)}`}
      </p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          <CancellationCard order={order} />
          <PackingWorksheet order={order} />
          <ProgressPhotos order={order} />
          <History order={order} />
        </div>
        <aside className="flex flex-col gap-6">
          <OrderActions order={order} />
          <CustomerAndShipping order={order} />
          <PaymentSummary order={order} />
        </aside>
      </div>
    </div>
  );
}
