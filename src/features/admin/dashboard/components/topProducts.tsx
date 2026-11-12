import { formatRupiah } from "@/lib/currency.lib";
import type { DashboardSales } from "@/types/dashboard.type";

type Row = { label: string; value: number; detail?: string };

// daftar batang horizontal 1 hue (kategori nominal -> 1 warna untuk semua batang, bukan gradasi).
// Label & nilai selalu tertulis, jadi tidak bergantung pada warna / panjang batang saja
export function BarList({ title, rows, empty, format = formatRupiah }: { title: string; rows: Row[]; empty: string; format?: (value: number) => string }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <section className="card border border-base-300 bg-base-100">
      <div className="card-body gap-3 p-4 sm:p-5">
        <h2 className="font-semibold text-ink">{title}</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-ink-muted">{empty}</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {rows.map((row) => (
              <li key={row.label} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="line-clamp-1 text-ink">{row.label}</span>
                  <span className="shrink-0 tabular-nums text-ink">{format(row.value)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken" aria-hidden="true">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max((row.value / max) * 100, row.value > 0 ? 2 : 0)}%` }} />
                </div>
                {row.detail && <span className="text-xs text-ink-muted">{row.detail}</span>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

const METHOD_LABEL: Record<string, string> = { QRIS: "QRIS", VIRTUAL_ACCOUNT: "Virtual Account", MANUAL_TRANSFER: "Manual transfer", UNKNOWN: "Other" };

// produk & kategori terlaris, komposisi penjualan, porsi metode bayar (PRD §12.2b)
export function TopProducts({ sales }: { sales: DashboardSales }) {
  const share = (value: number, total: number) => (total ? `${Math.round((value / total) * 100)}% of revenue` : undefined);
  const productRevenue = sales.composition.ready + sales.composition.custom;
  const paymentTotal = sales.paymentMethods.reduce((total, row) => total + row.orders, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <BarList
        title="Best-selling products"
        empty="No sales in this period yet."
        rows={sales.topProducts.map((row) => ({ label: row.name, value: row.revenue, detail: `${row.units} sold` }))}
      />
      <BarList
        title="Best-selling categories"
        empty="No sales in this period yet."
        rows={sales.topCategories.map((row) => ({ label: row.name, value: row.revenue, detail: `${row.units} sold` }))}
      />
      <BarList
        title="Sales mix"
        empty="No sales in this period yet."
        rows={
          productRevenue
            ? [
                { label: "Ready stock", value: sales.composition.ready, detail: share(sales.composition.ready, productRevenue) },
                { label: "Custom orders", value: sales.composition.custom, detail: share(sales.composition.custom, productRevenue) },
                { label: "Add-ons (included above)", value: sales.composition.addons },
                { label: "Shipping collected (not in revenue)", value: sales.composition.shipping },
              ]
            : []
        }
      />
      <BarList
        title="Payment methods"
        empty="No payments in this period yet."
        format={(value) => `${value} ${value === 1 ? "order" : "orders"}`}
        rows={sales.paymentMethods.map((row) => ({
          label: METHOD_LABEL[row.method] ?? row.method,
          value: row.orders,
          detail: `${paymentTotal ? Math.round((row.orders / paymentTotal) * 100) : 0}% of orders · ${formatRupiah(row.revenue)}`,
        }))}
      />
    </div>
  );
}
