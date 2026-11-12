import Link from "next/link";
import { PiArrowRight, PiLockSimple } from "react-icons/pi";
import { formatRupiah } from "@/lib/currency.lib";
import type { Cart } from "@/types/cart.type";

// ringkasan belanja (sticky di desktop). Ongkir & promo dihitung di checkout
export function CartSummary({ cart }: { cart: Cart }) {
  const { itemCount, subtotal, hasIssues } = cart.summary;

  return (
    <section aria-labelledby="cart-summary-title" className="card border border-base-300 bg-base-100 lg:sticky lg:top-24">
      <div className="card-body gap-4 p-5 sm:p-6">
        <h2 id="cart-summary-title" className="text-lg font-semibold text-ink">
          Order summary
        </h2>

        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">
              Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
            </dt>
            <dd className="font-medium tabular-nums text-ink">{formatRupiah(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">Shipping</dt>
            <dd className="text-ink-muted">Calculated at checkout</dd>
          </div>
        </dl>

        <div className="flex items-baseline justify-between gap-3 border-t border-base-300 pt-4">
          <span className="font-semibold text-ink">Total</span>
          <span className="text-xl font-bold tabular-nums text-accent-text">{formatRupiah(subtotal)}</span>
        </div>

        {hasIssues && (
          <p role="status" className="rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger-text">
            Some items need your attention. Fix or remove them before checking out.
          </p>
        )}

        {/* checkout dikunci selama ada item bermasalah (stok / produk tidak tersedia) */}
        {hasIssues ? (
          <button type="button" disabled className="btn btn-primary h-12 w-full text-[15px]">
            Checkout
            <PiArrowRight aria-hidden="true" size={18} />
          </button>
        ) : (
          <Link href="/checkout" className="btn btn-primary h-12 w-full text-[15px]">
            Checkout
            <PiArrowRight aria-hidden="true" size={18} />
          </Link>
        )}

        <p className="flex items-center justify-center gap-1.5 text-xs text-ink-muted">
          <PiLockSimple aria-hidden="true" size={14} />
          Prices and stock are confirmed at checkout
        </p>
      </div>
    </section>
  );
}
