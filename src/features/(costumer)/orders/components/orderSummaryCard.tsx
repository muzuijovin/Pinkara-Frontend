"use client";

import Image from "next/image";
import { PiCopySimple, PiImageSquare } from "react-icons/pi";
import { toast } from "react-toastify";
import { formatRupiah } from "@/lib/currency.lib";
import type { OrderDetail } from "@/types/order.type";

function copyText(text: string, label: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} copied`))
    .catch(() => toast.error("Couldn't copy. Please copy it manually."));
}

// ringkasan pesanan: item, rincian harga, pengiriman. Dipakai di halaman bayar & detail pesanan
export function OrderSummaryCard({ order }: { order: OrderDetail }) {
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
          {order.shipServiceName && (
            <p className="mt-2 text-ink">
              <span className="font-medium">{order.shipServiceName}</span>
              {order.shipEta && <span className="text-ink-muted"> · estimated {order.shipEta.toLowerCase()}</span>}
            </p>
          )}
          {order.buyerNote && <p className="mt-2 text-ink-muted wrap-break-word">Note: {order.buyerNote}</p>}
        </div>
      </div>
    </section>
  );
}

