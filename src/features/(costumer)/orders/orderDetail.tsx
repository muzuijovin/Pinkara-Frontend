"use client";

import { isAxiosError } from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PiArrowLeft, PiGift, PiPackage, PiReceipt, PiShoppingBag, PiTruck } from "react-icons/pi";
import { FormAlert } from "@/components/form/formAlert";
import { ProgressPhotoGrid } from "@/components/ui/progressPhotoGrid";
import { PageLoader } from "@/components/ui/pageLoader";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { OrderDetail as OrderDetailData } from "@/types/order.type";
import { OrderSummaryCard } from "./components/orderSummaryCard";
import { ORDER_STATUS, OrderStatusBadge } from "./constants/orderStatus";
import { useOrder } from "./hooks/useOrder";

const ADDON_ICON = { PACKAGING: PiPackage, PAPER_BAG: PiShoppingBag, GIFT_CARD: PiGift } as const;

// pesan singkat sesuai status, ditampilkan di bawah judul
const STATUS_MESSAGE: Partial<Record<OrderDetailData["status"], string>> = {
  MENUNGGU_PEMBAYARAN: "Complete your payment so we can start preparing your order.",
  DIBAYAR: "Payment received. We'll start preparing your order soon.",
  DIKEMAS: "We're carefully packing your order.",
  SIAP_KIRIM: "Your order is ready and waiting for the courier.",
  DIKIRIM: "Your order is on its way.",
  SELESAI: "Your order has been delivered. Thank you for shopping with us!",
  KEDALUWARSA: "The payment time ran out, so this order was cancelled automatically.",
  DIBATALKAN: "This order was cancelled.",
  PERLU_REFUND: "We received your payment, but we couldn't fulfil this order. Our team will refund you.",
  DIREFUND: "Your payment has been refunded.",
};

// riwayat status (PRD §11): dari order_status_history, terbaru di atas
function StatusTimeline({ history }: { history: OrderDetailData["statusHistory"] }) {
  const entries = [...history].reverse();

  return (
    <section aria-labelledby="timeline-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-4 p-5 sm:p-6">
        <h2 id="timeline-title" className="text-lg font-semibold text-ink">
          Order history
        </h2>
        <ol className="flex flex-col">
          {entries.map((entry, index) => (
            <li key={`${entry.toStatus}-${entry.createdAt}`} className="relative flex gap-3 pb-5 last:pb-0">
              {index < entries.length - 1 && (
                <span aria-hidden="true" className="absolute left-[5px] top-4 h-full w-px bg-base-300" />
              )}
              <span
                aria-hidden="true"
                className={`relative mt-1.5 size-[11px] shrink-0 rounded-full ${index === 0 ? "bg-primary" : "bg-base-300"}`}
              />
              <div className="min-w-0">
                <p className={`text-sm ${index === 0 ? "font-semibold text-ink" : "text-ink"}`}>
                  {ORDER_STATUS[entry.toStatus].label}
                </p>
                {entry.remark && <p className="text-xs text-ink-muted wrap-break-word">{entry.remark}</p>}
                <p className="text-xs text-ink-muted">{formatDateTimeWIB(entry.createdAt)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// rincian add-on per produk, termasuk isi gift card (ringkasan di samping hanya menghitung jumlahnya)
function AddonDetails({ items }: { items: OrderDetailData["items"] }) {
  const withAddons = items.filter((item) => item.addons.length > 0);
  if (!withAddons.length) return null;

  return (
    <section aria-labelledby="addons-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-4 p-5 sm:p-6">
        <h2 id="addons-title" className="text-lg font-semibold text-ink">
          Add-ons
        </h2>
        <ul className="flex flex-col gap-4">
          {withAddons.map((item) => (
            <li key={item.id}>
              <p className="text-sm font-semibold text-ink">{item.productName}</p>
              <ul className="mt-1.5 flex flex-col gap-1.5 text-sm text-ink">
                {item.addons.map((addon) => {
                  const Icon = ADDON_ICON[addon.type];
                  const from = addon.hideSender ? "Anonymous" : addon.senderName ? `From ${addon.senderName}` : null;
                  return (
                    <li key={addon.id} className="flex items-start gap-2">
                      <Icon aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-ink-muted" />
                      {addon.type === "GIFT_CARD" ? (
                        <span className="min-w-0">
                          Gift card
                          <span className="block text-ink-muted wrap-break-word">
                            {addon.giftMessage ? `“${addon.giftMessage}”` : "Blank card"}
                            {from && ` · ${from}`}
                          </span>
                        </span>
                      ) : (
                        <span>
                          {addon.type === "PACKAGING" ? `Packaging box ${addon.size ?? ""}` : "Paper bag"} × {addon.quantity}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// detail pesanan by kode (PRD §11, §14): status, bayar, resi, riwayat status, add-on, ringkasan
export function OrderDetail() {
  const { code } = useParams<{ code: string }>();
  const { data: order, isPending, isError, error, refetch } = useOrder(code);

  if (isPending) return <PageLoader />;

  if (isError) {
    const isNotFound = isAxiosError(error) && error.response?.status === 404;
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <PiReceipt aria-hidden="true" size={44} className="text-ink-muted" />
        {isNotFound ? (
          <div>
            <h1 className="text-xl font-semibold text-ink">Order not found</h1>
            <p className="mt-1 text-sm text-ink-muted">Check the order number, or find it in My Orders.</p>
          </div>
        ) : (
          <>
            <FormAlert message={getErrorMessage(error, "Couldn't load this order.")} />
            <button type="button" onClick={() => refetch()} className="btn btn-outline h-11">
              Try again
            </button>
          </>
        )}
        <Link href="/orders" className="btn btn-primary h-11">
          Go to My Orders
        </Link>
      </div>
    );
  }

  const isAwaitingPayment = order.status === "MENUNGGU_PEMBAYARAN";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <Link href="/orders" className="inline-flex items-center gap-1.5 rounded text-sm text-ink-muted hover:text-ink">
        <PiArrowLeft aria-hidden="true" size={16} />
        My orders
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-bold text-ink md:text-3xl">{order.code}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-ink-muted">Placed on {formatDateTimeWIB(order.createdAt)}</p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-label="Order status" className="card border border-base-300 bg-base-100">
            <div className="card-body gap-4 p-5 sm:p-6">
              <p className="text-sm text-ink">{STATUS_MESSAGE[order.status]}</p>

              {isAwaitingPayment && (
                <div className="flex flex-col gap-3 rounded-box bg-warning/15 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-ink">
                    Pay before <span className="font-semibold">{formatDateTimeWIB(order.expiresAt)}</span>
                  </p>
                  <Link href={`/orders/${order.code}/payment`} className="btn btn-primary h-10">
                    Pay now
                  </Link>
                </div>
              )}

              {order.trackingNo && (
                <div className="flex items-start gap-3 rounded-box bg-surface-muted p-4">
                  <PiTruck aria-hidden="true" size={22} className="mt-0.5 shrink-0 text-ink-muted" />
                  <div className="text-sm">
                    <p className="text-ink-muted">{order.courier ?? "Courier"} tracking number</p>
                    <p className="font-mono font-semibold text-ink">{order.trackingNo}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {order.progressPhotos.length > 0 && (
            <section aria-labelledby="progress-title" className="card border border-base-300 bg-base-100">
              <div className="card-body gap-4 p-5 sm:p-6">
                <h2 id="progress-title" className="text-lg font-semibold text-ink">
                  Progress photos
                </h2>
                <ProgressPhotoGrid photos={order.progressPhotos} />
              </div>
            </section>
          )}
          <AddonDetails items={order.items} />
          <StatusTimeline history={order.statusHistory} />
        </div>

        <OrderSummaryCard order={order} />
      </div>
    </div>
  );
}
