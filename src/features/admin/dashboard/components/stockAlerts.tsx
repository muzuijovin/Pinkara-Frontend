import Link from "next/link";
import { PiCheckCircle, PiWarning } from "react-icons/pi";
import type { DashboardOverview } from "@/types/dashboard.type";

// stok menipis & habis (PRD §12.2c) + tombol langsung ke tempat menambah stok
export function StockAlerts({ stock }: { stock: DashboardOverview["stock"] }) {
  const nothing = !stock.lowStockVariants.length && !stock.lowStockAddons.length && !stock.outOfStock.length;

  return (
    <section aria-labelledby="stock-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-4 p-4 sm:p-5">
        <h2 id="stock-title" className="font-semibold text-ink">
          Stock alerts
        </h2>
        {nothing && (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <PiCheckCircle aria-hidden="true" size={18} className="text-success-text" /> Everything is well stocked.
          </p>
        )}

        {stock.outOfStock.length > 0 && (
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-danger-text">
              <PiWarning aria-hidden="true" size={16} /> Out of stock ({stock.outOfStock.length})
            </p>
            <ul className="mt-1.5 flex flex-col gap-1 text-sm">
              {stock.outOfStock.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1 text-ink">{product.name}</span>
                  <Link href={`/admin/products/${product.id}/edit`} className="shrink-0 text-xs font-semibold text-accent-text hover:underline">
                    Add stock
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {stock.lowStockVariants.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-ink">Products running low</p>
            <ul className="mt-1.5 flex flex-col gap-1 text-sm">
              {stock.lowStockVariants.map((variant) => (
                <li key={variant.variantId} className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1 text-ink">
                    {variant.productName}
                    {variant.label !== "Default" && <span className="text-ink-muted"> · {variant.label}</span>}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="tabular-nums text-ink-muted">{variant.stock} left</span>
                    <Link href={`/admin/products/${variant.productId}/edit`} className="text-xs font-semibold text-accent-text hover:underline">
                      Add stock
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {stock.lowStockAddons.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-ink">Add-ons running low</p>
            <ul className="mt-1.5 flex flex-col gap-1 text-sm">
              {stock.lowStockAddons.map((addon) => (
                <li key={addon.id} className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1 text-ink">{addon.name}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className={`tabular-nums ${addon.stock === 0 ? "font-semibold text-danger-text" : "text-ink-muted"}`}>
                      {addon.stock === 0 ? "Out of stock" : `${addon.stock} left`}
                    </span>
                    <Link href="/admin/addons" className="text-xs font-semibold text-accent-text hover:underline">
                      Add stock
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
