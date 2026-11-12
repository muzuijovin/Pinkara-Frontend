import Link from "next/link";
import type { DashboardOverview } from "@/types/dashboard.type";

// promo 5 pembeli pertama: terpakai / direservasi / sisa + akun yang memakai (PRD §12.2c)
export function PromoQuota({ promo }: { promo: DashboardOverview["promo"] }) {
  return (
    <section aria-labelledby="promo-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-3 p-4 sm:p-5">
        <h2 id="promo-title" className="font-semibold text-ink">
          Launch promo
        </h2>
        {!promo ? (
          <p className="text-sm text-ink-muted">No active promo.</p>
        ) : (
          <>
            <p className="text-sm text-ink-muted">{promo.name}</p>
            {/* batang bersegmen: terpakai | direservasi | sisa, dengan legenda tertulis */}
            <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
              {promo.used > 0 && <div className="bg-primary" style={{ flex: promo.used }} />}
              {promo.reserved > 0 && <div className="bg-primary/40" style={{ flex: promo.reserved }} />}
              {promo.remaining > 0 && <div className="bg-surface-sunken" style={{ flex: promo.remaining }} />}
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Used", value: promo.used, swatch: "bg-primary" },
                { label: "Reserved", value: promo.reserved, swatch: "bg-primary/40" },
                { label: "Left", value: promo.remaining, swatch: "bg-surface-sunken" },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="flex items-center justify-center gap-1.5 text-xs text-ink-muted">
                    <span aria-hidden="true" className={`size-2.5 rounded-full ${item.swatch}`} />
                    {item.label}
                  </dt>
                  <dd className="text-xl font-bold tabular-nums text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
            {promo.redemptions.length > 0 && (
              <ul className="flex flex-col gap-1 border-t border-base-300 pt-3 text-sm">
                {promo.redemptions.map((row) => (
                  <li key={row.orderCode} className="flex items-center justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate text-ink">{row.name}</span>
                      <span className="block truncate text-xs text-ink-muted">{row.email}</span>
                    </span>
                    <Link href={`/admin/orders/${row.orderCode}`} className="shrink-0 text-xs text-accent-text hover:underline">
                      {row.status === "USED" ? "Paid" : "Reserved"} · {row.orderCode}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
}
