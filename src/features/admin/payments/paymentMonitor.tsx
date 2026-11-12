"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PiCaretLeft, PiCaretRight, PiCreditCard, PiMagnifyingGlass, PiWarningCircle } from "react-icons/pi";
import { useDebouncedCallback } from "use-debounce";
import { FormAlert } from "@/components/form/formAlert";
import { formatRupiah } from "@/lib/currency.lib";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { AdminPayment } from "@/types/adminPayment.type";
import type { PaymentMethod } from "@/types/order.type";
import { PaymentFlags } from "./components/paymentFlags";
import { PaymentDetailDialog } from "./components/paymentDetailDialog";
import { PAYMENT_STATUS, PAYMENT_STATUS_TABS, PaymentStatusBadge, isPaymentStatus, paymentMethodLabel } from "./constants/paymentStatus";
import { useAdminPayments } from "./hooks/useAdminPayments";

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "QRIS", label: "QRIS" },
  { value: "VIRTUAL_ACCOUNT", label: "Virtual Account" },
];
const isMethod = (value: string | null): value is PaymentMethod => value === "QRIS" || value === "VIRTUAL_ACCOUNT";
const isDate = (value: string | null) => (value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined);

// nominal: tagihan, dan nominal diterima kalau berbeda
function Amount({ payment }: { payment: AdminPayment }) {
  return (
    <span className="tabular-nums">
      {formatRupiah(payment.amount)}
      {payment.paidAmount !== null && payment.paidAmount !== payment.amount && (
        <span className="block text-xs text-danger-text">Received {formatRupiah(payment.paidAmount)}</span>
      )}
    </span>
  );
}

// pemantauan transaksi (PRD §9, §12): pembayaran QRIS / VA dikonfirmasi otomatis oleh Midtrans.
// Admin memantau, melihat yang perlu perhatian, dan bisa cek status langsung ke Midtrans. Filter di URL
export function PaymentMonitor() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openId, setOpenId] = useState<string | null>(null);

  const statusParam = searchParams.get("status");
  const methodParam = searchParams.get("method");
  const params = {
    page: Math.max(1, Number(searchParams.get("page")) || 1),
    status: isPaymentStatus(statusParam) ? statusParam : undefined,
    method: isMethod(methodParam) ? methodParam : undefined,
    attention: searchParams.get("attention") === "true",
    search: searchParams.get("search") ?? "",
    from: isDate(searchParams.get("from")),
    to: isDate(searchParams.get("to")),
  };

  const { data, isPending, isError, error, isFetching, refetch } = useAdminPayments(params);
  const payments = data?.payments ?? [];
  const meta = data?.meta;
  const counts = meta?.statusCounts ?? {};
  const totalAll = Object.values(counts).reduce((total, count) => total + (count ?? 0), 0);
  const isFiltered = Boolean(params.status || params.method || params.attention || params.search || params.from || params.to);

  const updateParams = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in changes)) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  const handleSearch = useDebouncedCallback((value: string) => updateParams({ search: value.trim() || undefined }), 300);

  const tabClass = (active: boolean) =>
    `tab h-10 gap-1.5 whitespace-nowrap px-3 text-sm ${active ? "tab-active font-semibold text-ink" : "text-ink-muted"}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <div>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">Payments</h1>
        <p className="mt-1 text-sm text-ink-muted">
          QRIS and Virtual Account payments are confirmed automatically by Midtrans. Use this page to monitor them and check anything unusual.
        </p>
      </div>

      {/* pintasan ke tagihan yang perlu dicek */}
      {meta && meta.attentionCount > 0 && !params.attention && (
        <button
          type="button"
          onClick={() => updateParams({ attention: "true", status: undefined })}
          className="mt-5 flex w-full items-center gap-3 rounded-box bg-danger-soft px-4 py-3 text-left text-sm text-danger-text transition-colors hover:bg-danger-soft/70"
        >
          <PiWarningCircle aria-hidden="true" size={20} className="shrink-0" />
          <span className="flex-1">
            <span className="font-semibold">
              {meta.attentionCount} {meta.attentionCount === 1 ? "payment needs" : "payments need"} attention
            </span>{" "}
            · wrong amount or refund needed
          </span>
          <span className="font-medium underline underline-offset-2">Show</span>
        </button>
      )}

      {/* tab status (angka mengikuti filter lain) */}
      <div role="tablist" aria-label="Payment status" className="tabs tabs-border mt-6 flex-nowrap overflow-x-auto">
        <button type="button" role="tab" aria-selected={!params.status && !params.attention} onClick={() => updateParams({ status: undefined, attention: undefined })} className={tabClass(!params.status && !params.attention)}>
          All <span className="text-xs text-ink-muted tabular-nums">{totalAll}</span>
        </button>
        <button type="button" role="tab" aria-selected={params.attention} onClick={() => updateParams({ attention: "true", status: undefined })} className={tabClass(params.attention)}>
          Needs attention
          {meta && meta.attentionCount > 0 && <span className="badge badge-xs border-none bg-danger-soft text-danger-text tabular-nums">{meta.attentionCount}</span>}
        </button>
        {PAYMENT_STATUS_TABS.map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={params.status === status}
            onClick={() => updateParams({ status, attention: undefined })}
            className={tabClass(params.status === status)}
          >
            {PAYMENT_STATUS[status].label} <span className="text-xs text-ink-muted tabular-nums">{counts[status] ?? 0}</span>
          </button>
        ))}
      </div>

      <section aria-label="Filters" className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto] md:items-end">
        <label className="col-span-2 flex flex-col gap-1 md:col-span-1">
          <span className="text-xs font-medium text-ink-muted">Search</span>
          <span className="input input-sm h-10 w-full border-base-300">
            <PiMagnifyingGlass aria-hidden="true" size={16} className="text-ink-muted" />
            <input
              type="search"
              key={params.search}
              defaultValue={params.search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Order code, buyer name or email"
              className="text-ink"
            />
          </span>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">Method</span>
          <select value={params.method ?? ""} onChange={(event) => updateParams({ method: event.target.value || undefined })} className="select select-sm h-10 w-full border-base-300 text-ink">
            <option value="">All methods</option>
            {METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">From</span>
          <input type="date" value={params.from ?? ""} max={params.to} onChange={(event) => updateParams({ from: event.target.value || undefined })} className="input input-sm h-10 w-full border-base-300 text-ink" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">To</span>
          <input type="date" value={params.to ?? ""} min={params.from} onChange={(event) => updateParams({ to: event.target.value || undefined })} className="input input-sm h-10 w-full border-base-300 text-ink" />
        </label>
        {isFiltered && (
          <button type="button" onClick={() => router.replace(pathname)} className="btn btn-ghost btn-sm h-10 text-ink">
            Clear filters
          </button>
        )}
      </section>

      <section aria-label="Payments" aria-busy={isFetching} className={`mt-5 transition-opacity ${isFetching && !isPending ? "opacity-60" : ""}`}>
        {isPending && <div className="skeleton h-96 w-full" />}
        {isError && (
          <div className="flex flex-col gap-3">
            <FormAlert message={getErrorMessage(error, "Couldn't load payments.")} />
            <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
              Try again
            </button>
          </div>
        )}

        {data && payments.length === 0 && (
          <div className="card flex flex-col items-center gap-3 border border-dashed border-base-300 bg-base-100 px-6 py-14 text-center">
            <PiCreditCard aria-hidden="true" size={32} className="text-ink-muted" />
            <p className="font-medium text-ink">{params.attention ? "Nothing needs attention" : isFiltered ? "No payments match these filters" : "No payments yet"}</p>
            {isFiltered && (
              <button type="button" onClick={() => router.replace(pathname)} className="btn btn-outline btn-sm h-10">
                Clear filters
              </button>
            )}
          </div>
        )}

        {payments.length > 0 && (
          <>
            {/* desktop: tabel */}
            <div className="card hidden overflow-x-auto border border-base-300 bg-base-100 md:block">
              <table className="table">
                <thead>
                  <tr className="text-ink-muted">
                    <th scope="col">Order</th>
                    <th scope="col">Buyer</th>
                    <th scope="col">Method</th>
                    <th scope="col" className="text-right">
                      Amount
                    </th>
                    <th scope="col">Status</th>
                    <th scope="col">Created</th>
                    <th scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="align-top">
                      <td className="text-sm font-medium text-ink">{payment.order.code}</td>
                      <td className="max-w-48 text-sm">
                        <span className="block truncate text-ink">{payment.order.user.name}</span>
                        <span className="block truncate text-xs text-ink-muted">{payment.order.user.email}</span>
                      </td>
                      <td className="text-sm text-ink">{paymentMethodLabel(payment.method, payment.vaBank)}</td>
                      <td className="text-right text-sm text-ink">
                        <Amount payment={payment} />
                      </td>
                      <td>
                        <div className="flex flex-col items-start gap-1">
                          <PaymentStatusBadge status={payment.status} />
                          <PaymentFlags payment={payment} />
                        </div>
                      </td>
                      <td className="text-sm whitespace-nowrap text-ink-muted tabular-nums">{formatDateTimeWIB(payment.createdAt)}</td>
                      <td className="text-right">
                        <button type="button" onClick={() => setOpenId(payment.id)} aria-label={`View payment for ${payment.order.code}`} className="btn btn-ghost btn-sm h-9 text-ink">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile: kartu */}
            <ul className="flex flex-col gap-3 md:hidden">
              {payments.map((payment) => (
                <li key={payment.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(payment.id)}
                    aria-label={`View payment for ${payment.order.code}`}
                    className="card w-full gap-2 border border-base-300 bg-base-100 p-4 text-left transition-colors hover:border-primary/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{payment.order.code}</p>
                        <p className="truncate text-xs text-ink-muted">{payment.order.user.name}</p>
                      </div>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                    <div className="flex items-end justify-between gap-3 text-sm">
                      <span className="text-ink-muted">{paymentMethodLabel(payment.method, payment.vaBank)}</span>
                      <span className="text-right font-semibold text-ink">
                        <Amount payment={payment} />
                      </span>
                    </div>
                    <PaymentFlags payment={payment} />
                    <p className="text-xs text-ink-muted tabular-nums">{formatDateTimeWIB(payment.createdAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {meta && meta.totalPage > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-muted tabular-nums">
            Page {meta.page} of {meta.totalPage} · {meta.totalPayments} payments
          </p>
          <div className="join">
            <button type="button" disabled={params.page <= 1} onClick={() => updateParams({ page: String(params.page - 1) })} className="btn join-item h-10 gap-1">
              <PiCaretLeft aria-hidden="true" size={16} />
              Previous
            </button>
            <button type="button" disabled={params.page >= meta.totalPage} onClick={() => updateParams({ page: String(params.page + 1) })} className="btn join-item h-10 gap-1">
              Next
              <PiCaretRight aria-hidden="true" size={16} />
            </button>
          </div>
        </nav>
      )}

      {openId && <PaymentDetailDialog paymentId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
