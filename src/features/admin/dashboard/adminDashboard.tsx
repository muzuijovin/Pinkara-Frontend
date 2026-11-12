"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormAlert } from "@/components/form/formAlert";
import { useSession } from "@/features/auth/hooks/useSession";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { DashboardPeriod } from "@/types/dashboard.type";
import { ActionCards } from "./components/actionCards";
import { ActivityFeed } from "./components/activityFeed";
import { KpiCards } from "./components/kpiCards";
import { PromoQuota } from "./components/promoQuota";
import { RevenueChart } from "./components/revenueChart";
import { StockAlerts } from "./components/stockAlerts";
import { TopProducts } from "./components/topProducts";
import { useDashboardOverview, useDashboardSales } from "./hooks/useDashboard";

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "month", label: "This month" },
];
const isPeriod = (value: string | null): value is DashboardPeriod => PERIODS.some((period) => period.value === value);
const isDate = (value: string | null): value is string => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));

// filter periode di URL (?period=7d atau ?from=&to=) supaya bisa dibagikan & tombol back berfungsi
function PeriodFilter({ period, from, to }: { period: DashboardPeriod; from?: string; to?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showCustom, setShowCustom] = useState(Boolean(from));
  const [draftFrom, setDraftFrom] = useState(from ?? "");
  const [draftTo, setDraftTo] = useState(to ?? "");
  const go = (query: string) => router.replace(`${pathname}?${query}`, { scroll: false });
  const customActive = Boolean(from && to);

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="Period" className="flex flex-wrap gap-1">
        {PERIODS.map((item) => {
          const active = !customActive && period === item.value;
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setShowCustom(false);
                go(`period=${item.value}`);
              }}
              className={`btn btn-sm h-9 rounded-full px-4 ${active ? "border-ink bg-ink text-base-100 hover:bg-ink" : "btn-ghost border-base-300 text-ink"}`}
            >
              {item.label}
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={customActive}
          aria-expanded={showCustom}
          onClick={() => setShowCustom((value) => !value)}
          className={`btn btn-sm h-9 rounded-full px-4 ${customActive ? "border-ink bg-ink text-base-100 hover:bg-ink" : "btn-ghost border-base-300 text-ink"}`}
        >
          Custom range
        </button>
      </div>
      {showCustom && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (draftFrom && draftTo && draftFrom <= draftTo) go(`from=${draftFrom}&to=${draftTo}`);
          }}
          className="flex flex-wrap items-end gap-2"
        >
          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            From
            <input type="date" value={draftFrom} max={draftTo || undefined} onChange={(event) => setDraftFrom(event.target.value)} className="input input-sm h-10 text-base sm:text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            To
            <input type="date" value={draftTo} min={draftFrom || undefined} onChange={(event) => setDraftTo(event.target.value)} className="input input-sm h-10 text-base sm:text-sm" />
          </label>
          <button type="submit" disabled={!draftFrom || !draftTo || draftFrom > draftTo} className="btn btn-primary btn-sm h-10">
            Apply
          </button>
        </form>
      )}
    </div>
  );
}

// dashboard admin (PRD §12.2): dalam 5 detik penjual tahu apa yang harus dikerjakan & bagaimana penjualan berjalan
export function AdminDashboardSection() {
  const searchParams = useSearchParams();
  const { data: user } = useSession();
  const periodParam = searchParams.get("period");
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const from = isDate(fromParam) && isDate(toParam) ? fromParam : undefined;
  const to = from ? (toParam as string) : undefined;
  const period = isPeriod(periodParam) ? periodParam : "7d";

  const overview = useDashboardOverview();
  const sales = useDashboardSales({ period, from, to });

  // badge jumlah tindakan di judul tab browser (PRD §12.2e). useEffect hanya untuk document.title
  const pending = overview.data
    ? overview.data.actions.toProcess.count +
      overview.data.actions.needTracking +
      overview.data.actions.customAwaitingReply.count +
      overview.data.actions.refunds +
      overview.data.actions.manualVerification
    : 0;
  useEffect(() => {
    const original = "Dashboard | Pinkara Admin";
    document.title = pending ? `(${pending}) ${original}` : original;
    return () => {
      document.title = original;
    };
  }, [pending]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6">
      <header>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">Hi{user ? `, ${user.name.split(" ")[0]}` : ""}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Here&apos;s what needs you today and how the shop is doing.
          {overview.dataUpdatedAt > 0 && ` Updated ${formatDateTimeWIB(new Date(overview.dataUpdatedAt))}.`}
        </p>
      </header>

      {overview.isPending && <div className="skeleton h-48 w-full" />}
      {overview.isError && <FormAlert message={getErrorMessage(overview.error, "Couldn't load the dashboard.")} />}
      {overview.data && <ActionCards actions={overview.data.actions} />}

      <section aria-labelledby="sales-title" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <h2 id="sales-title" className="text-lg font-semibold text-ink">
            Sales
          </h2>
          <PeriodFilter key={`${period}-${from}-${to}`} period={period} from={from} to={to} />
        </div>
        {sales.isPending && <div className="skeleton h-96 w-full" />}
        {sales.isError && <FormAlert message={getErrorMessage(sales.error, "Couldn't load sales.")} />}
        {sales.data && (
          <div className={`flex flex-col gap-4 transition-opacity ${sales.isPlaceholderData ? "opacity-60" : ""}`}>
            <KpiCards kpis={sales.data.kpis} />
            <RevenueChart series={sales.data.series} />
            <TopProducts sales={sales.data} />
          </div>
        )}
      </section>

      {overview.data && (
        <div className="grid items-start gap-4 lg:grid-cols-3">
          <StockAlerts stock={overview.data.stock} />
          <PromoQuota promo={overview.data.promo} />
          <ActivityFeed activity={overview.data.activity} />
        </div>
      )}
    </div>
  );
}
