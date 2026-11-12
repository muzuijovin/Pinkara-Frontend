import { PiArrowDownRight, PiArrowUpRight, PiMinus } from "react-icons/pi";
import { formatRupiah } from "@/lib/currency.lib";
import type { DashboardSales } from "@/types/dashboard.type";

// perubahan vs periode sebelumnya: arah ditandai ikon + teks (bukan warna saja)
function Change({ change }: { change: number | null }) {
  if (change === null) return <span className="text-xs text-ink-muted">New this period</span>;
  if (change === 0)
    return (
      <span className="flex items-center gap-0.5 text-xs text-ink-muted">
        <PiMinus aria-hidden="true" size={12} /> No change
      </span>
    );
  const up = change > 0;
  const Icon = up ? PiArrowUpRight : PiArrowDownRight;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? "text-success-text" : "text-danger-text"}`}>
      <Icon aria-hidden="true" size={14} />
      {up ? "Up" : "Down"} {Math.abs(change)}%<span className="font-normal text-ink-muted"> vs previous period</span>
    </span>
  );
}

// KPI (PRD §12.2b): omzet, pesanan dibayar, rata-rata nilai pesanan, pembeli baru. Stat tile, bukan grafik
export function KpiCards({ kpis }: { kpis: DashboardSales["kpis"] }) {
  const tiles = [
    { label: "Revenue", value: formatRupiah(kpis.revenue.value), change: kpis.revenue.change, hint: "Paid orders, after discounts & refunds, without shipping" },
    { label: "Paid orders", value: kpis.paidOrders.value.toLocaleString("en-US"), change: kpis.paidOrders.change },
    { label: "Average order value", value: formatRupiah(kpis.averageOrderValue.value), change: kpis.averageOrderValue.change },
    { label: "New buyers", value: kpis.newBuyers.value.toLocaleString("en-US"), change: kpis.newBuyers.change, hint: "First paid order in this period" },
  ];

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <li key={tile.label} className="card border border-base-300 bg-base-100">
          <div className="card-body gap-1 p-4">
            <p className="text-sm text-ink-muted" title={tile.hint}>
              {tile.label}
            </p>
            <p className="text-2xl font-bold tabular-nums text-ink">{tile.value}</p>
            <Change change={tile.change} />
          </div>
        </li>
      ))}
    </ul>
  );
}
