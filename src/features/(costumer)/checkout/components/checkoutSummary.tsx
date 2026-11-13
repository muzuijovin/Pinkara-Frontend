import { PiConfetti, PiLockSimple, PiWarningCircle } from "react-icons/pi";
import { formatRupiah } from "@/lib/currency.lib";

type CheckoutSummaryProps = {
  subtotal: number;
  addonTotal: number;
  discount: number;
  promoName: string | null;
  promoRemaining: number | null;
  shippingFee: number;
  total: number;
  notice?: string; // mis. "total berubah" setelah server menolak
  disabledReason?: string;
  isPending: boolean;
  onPlaceOrder: () => void;
};

// ringkasan pembayaran (Figma: "Ringkasan Pembayaran"), sticky di desktop
export function CheckoutSummary({
  subtotal,
  addonTotal,
  discount,
  promoName,
  promoRemaining,
  shippingFee,
  total,
  notice,
  disabledReason,
  isPending,
  onPlaceOrder,
}: CheckoutSummaryProps) {
  return (
    <section aria-labelledby="checkout-summary-title" className="card border border-base-300 bg-base-100 lg:sticky lg:top-24">
      <div className="card-body gap-4 p-5 sm:p-6">
        <h2 id="checkout-summary-title" className="text-lg font-semibold text-ink">
          Order summary
        </h2>

        {discount > 0 && promoName && (
          <p className="flex items-start gap-2 rounded-lg bg-success-soft px-3 py-2 text-xs text-success-text">
            <PiConfetti aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
            <span>
              <span className="font-semibold">{promoName}</span> applied
              {promoRemaining !== null && ` · ${promoRemaining} ${promoRemaining === 1 ? "spot" : "spots"} left`}
            </span>
          </p>
        )}

        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">Products</dt>
            <dd className="tabular-nums text-ink">{formatRupiah(subtotal)}</dd>
          </div>
          {addonTotal > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Add-ons</dt>
              <dd className="tabular-nums text-ink">{formatRupiah(addonTotal)}</dd>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-success-text">Promo discount</dt>
              <dd className="tabular-nums text-success-text">−{formatRupiah(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">Shipping</dt>
            <dd className="tabular-nums text-ink">{shippingFee ? formatRupiah(shippingFee) : "Free"}</dd>
          </div>
        </dl>

        <div className="flex items-baseline justify-between gap-3 border-t border-base-300 pt-4">
          <span className="font-semibold text-ink">Total</span>
          <span className="text-2xl font-bold tabular-nums text-accent-text">{formatRupiah(total)}</span>
        </div>

        {notice && (
          <p role="status" className="flex items-start gap-2 rounded-lg bg-warning/15 px-3 py-2 text-xs text-ink">
            <PiWarningCircle aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-warning" />
            {notice}
          </p>
        )}

        <button
          type="button"
          disabled={Boolean(disabledReason) || isPending}
          onClick={onPlaceOrder}
          className="btn btn-primary h-12 w-full text-[15px]"
        >
          {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
          {isPending ? "Placing your order..." : "Place order"}
        </button>
        {/* pesanan + tagihan dibuat sekaligus (beberapa detik): beri tahu supaya tidak diklik ulang / ditutup */}
        {isPending && (
          <p role="status" className="text-center text-xs text-ink-muted">
            Reserving your items and preparing your payment. This can take a few seconds, please keep this page open.
          </p>
        )}
        {disabledReason && <p className="text-center text-xs text-danger-text">{disabledReason}</p>}

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-muted">
          <PiLockSimple aria-hidden="true" size={14} />
          Your items are reserved once the order is placed
        </p>
      </div>
    </section>
  );
}
