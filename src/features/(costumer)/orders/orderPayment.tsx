"use client";

import { isAxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PiCheckCircle, PiClock, PiCopySimple, PiImageSquare, PiReceipt } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { CheckoutSteps } from "@/components/ui/checkoutSteps";
import { PageLoader } from "@/components/ui/pageLoader";
import { formatRupiah } from "@/lib/currency.lib";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { OrderDetail, PaymentMethod } from "@/types/order.type";
import { PaymentPanel } from "./components/paymentPanel";
import { formatCountdown, useCountdown } from "./hooks/useCountdown";
import { useOrder } from "./hooks/useOrder";

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  QRIS: "QRIS",
  VIRTUAL_ACCOUNT: "Bank transfer (Virtual Account)",
  MANUAL_TRANSFER: "Manual bank transfer",
};

function copyText(text: string, label: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} copied`))
    .catch(() => toast.error("Couldn't copy. Please copy it manually."));
}

// hitung mundur batas bayar + nominal tagihan
function PaymentCountdown({ order, onExpired }: { order: OrderDetail; onExpired: React.ReactNode }) {
  const remaining = useCountdown(order.expiresAt, order.serverTime);

  if (remaining === 0) return <>{onExpired}</>;

  const isUrgent = remaining < 5 * 60 * 1000;

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div>
        <p className="text-sm text-ink-muted">Complete your payment within</p>
        <p
          role="timer"
          aria-live="off"
          className={`mt-1 font-mono text-4xl font-bold tabular-nums ${isUrgent ? "text-danger-text" : "text-ink"}`}
        >
          {formatCountdown(remaining)}
        </p>
        <p className="mt-1 text-xs text-ink-muted">Pay before {formatDateTimeWIB(order.expiresAt)}</p>
      </div>

      <div className="w-full rounded-box bg-surface-muted p-4">
        <p className="text-sm text-ink-muted">Total to pay</p>
        <div className="mt-1 flex items-center justify-center gap-2">
          <span className="text-3xl font-bold tabular-nums text-accent-text">{formatRupiah(order.total)}</span>
          <button
            type="button"
            onClick={() => copyText(String(order.total), "Amount")}
            aria-label="Copy amount"
            className="btn btn-ghost btn-square btn-sm size-9 text-ink-muted"
          >
            <PiCopySimple aria-hidden="true" size={18} />
          </button>
        </div>
        {order.paymentMethod && (
          <p className="mt-1 text-sm text-ink">
            via <span className="font-semibold">{PAYMENT_LABEL[order.paymentMethod]}</span>
          </p>
        )}
      </div>

      {/* QR / nomor VA dari payment gateway (Midtrans), atau pilih metode dulu */}
      <PaymentPanel order={order} />
    </div>
  );
}

function StatusCard({ icon, title, message, children }: { icon: React.ReactNode; title: string; message: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      {icon}
      <div>
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">{message}</p>
      </div>
      {children}
    </div>
  );
}

function OrderSummary({ order }: { order: OrderDetail }) {
  return (
    <section aria-labelledby="order-summary-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-4 p-5 sm:p-6">
        <header className="flex items-center justify-between gap-3">
          <h2 id="order-summary-title" className="text-lg font-semibold text-ink">
            Order summary
          </h2>
          <button
            type="button"
            onClick={() => copyText(order.code, "Order number")}
            className="flex items-center gap-1 rounded font-mono text-sm text-ink-muted hover:text-ink"
            aria-label={`Copy order number ${order.code}`}
          >
            {order.code}
            <PiCopySimple aria-hidden="true" size={14} />
          </button>
        </header>

        <ul className="flex flex-col divide-y divide-base-300">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                ) : (
                  <PiImageSquare aria-hidden="true" size={18} className="absolute inset-0 m-auto text-ink-muted" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3 text-sm">
                  <p className="line-clamp-2 font-medium text-ink">{item.productName}</p>
                  <p className="shrink-0 tabular-nums text-ink">{formatRupiah(item.lineTotal)}</p>
                </div>
                <p className="text-xs text-ink-muted">
                  {item.variantLabel && item.variantLabel !== "Default" && <>Size {item.variantLabel} · </>}Qty {item.quantity}
                  {item.addons.length > 0 && <> · {item.addons.length} add-on{item.addons.length > 1 ? "s" : ""}</>}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <dl className="flex flex-col gap-1.5 border-t border-base-300 pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">Products</dt>
            <dd className="tabular-nums text-ink">{formatRupiah(order.subtotal)}</dd>
          </div>
          {order.addonTotal > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Add-ons</dt>
              <dd className="tabular-nums text-ink">{formatRupiah(order.addonTotal)}</dd>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-success-text">{order.promotionName ?? "Promo discount"}</dt>
              <dd className="tabular-nums text-success-text">−{formatRupiah(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">Shipping</dt>
            <dd className="tabular-nums text-ink">{order.shippingFee ? formatRupiah(order.shippingFee) : "Free"}</dd>
          </div>
          {order.uniqueCode > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Unique code</dt>
              <dd className="tabular-nums text-ink">{formatRupiah(order.uniqueCode)}</dd>
            </div>
          )}
          <div className="mt-1 flex justify-between gap-3 font-semibold">
            <dt className="text-ink">Total</dt>
            <dd className="tabular-nums text-ink">{formatRupiah(order.total)}</dd>
          </div>
        </dl>

        <div className="border-t border-base-300 pt-4 text-sm">
          <p className="font-semibold text-ink">{order.shippingMethod === "PICKUP" ? "Pick up at studio" : "Deliver to"}</p>
          {order.shippingMethod === "COURIER" && (
            <p className="mt-1 text-ink-muted">
              {order.shipRecipientName} · {order.shipRecipientPhone}
              <br />
              {order.shipFullAddress}, {order.shipCity} {order.shipPostalCode}
            </p>
          )}
          {order.buyerNote && <p className="mt-2 text-ink-muted wrap-break-word">Note: {order.buyerNote}</p>}
        </div>
      </div>
    </section>
  );
}

// halaman bayar (PRD §9, langkah 3 checkout): hitung mundur dari expiresAt server + tagihan QRIS / VA.
// QR / nomor VA dari Midtrans (atau gateway mock di lokal); status dicek tiap 5 detik
export function OrderPayment() {
  const { code } = useParams<{ code: string }>();
  const { data: order, isPending, isError, error, refetch } = useOrder(code);

  if (isPending) return <PageLoader />;

  if (isError) {
    const isNotFound = isAxiosError(error) && error.response?.status === 404;
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        {isNotFound ? (
          <StatusCard
            icon={<PiReceipt aria-hidden="true" size={44} className="text-ink-muted" />}
            title="Order not found"
            message="Check the order number, or find it in My Orders."
          />
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

  const expiredCard = (
    <StatusCard
      icon={<PiClock aria-hidden="true" size={44} className="text-danger-text" />}
      title="Payment time is up"
      message="This order has expired and the items were released. You can place a new order anytime."
    >
      <Link href="/products" className="btn btn-primary h-11">
        Back to catalog
      </Link>
    </StatusCard>
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <CheckoutSteps current={2} />
      <h1 className="mt-6 text-2xl font-bold text-ink md:text-3xl">Payment</h1>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <section aria-label="Payment status" className="card border border-base-300 bg-base-100">
          <div className="card-body p-5 sm:p-8">
            {order.status === "MENUNGGU_PEMBAYARAN" && <PaymentCountdown order={order} onExpired={expiredCard} />}
            {order.status === "KEDALUWARSA" && expiredCard}
            {order.status === "DIBATALKAN" && (
              <StatusCard
                icon={<PiClock aria-hidden="true" size={44} className="text-danger-text" />}
                title="Order cancelled"
                message="This order was cancelled."
              />
            )}
            {!["MENUNGGU_PEMBAYARAN", "KEDALUWARSA", "DIBATALKAN"].includes(order.status) && (
              <StatusCard
                icon={<PiCheckCircle aria-hidden="true" size={44} className="text-success-text" />}
                title="Payment received"
                message="Thank you! We're preparing your order."
              >
                <Link href={`/orders/${order.code}`} className="btn btn-primary h-11">
                  View order
                </Link>
              </StatusCard>
            )}
          </div>
        </section>

        <OrderSummary order={order} />
      </div>
    </div>
  );
}
