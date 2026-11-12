"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PiArrowRight, PiCaretLeft, PiCaretRight, PiClipboardText, PiFunnelSimple } from "react-icons/pi";
import { FormAlert } from "@/components/form/formAlert";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { AuditEntity, AuditLog } from "@/types/auditLog.type";
import { useAuditLogFilters, useAuditLogs } from "./hooks/useAuditLogs";

export const ENTITY_LABEL: Record<AuditEntity, string> = {
  order: "Order",
  product: "Product",
  addon: "Add-on",
  category: "Category",
  gallery: "Gallery",
};
const ENTITIES = Object.keys(ENTITY_LABEL) as AuditEntity[];
const isEntity = (value: string | null): value is AuditEntity => Boolean(value && value in ENTITY_LABEL);
const isDate = (value: string | null) => (value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined);

// nama aksi yang sudah dikenal; aksi lain ditampilkan dari kodenya ("stock_adjust" -> "Stock adjust")
const ACTION_LABEL: Record<string, string> = {
  create: "Created",
  update: "Edited",
  delete: "Deleted",
  reorder: "Reordered",
  status_change: "Status changed",
  stock_adjust: "Stock adjusted",
  progress_photo: "Progress photo",
};
export const humanize = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());
export const actionLabel = (action: string) => ACTION_LABEL[action] ?? humanize(action);

// nilai di catatan sebelum/sesudah -> teks pendek yang bisa dibaca
export function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString("id-ID");
  if (Array.isArray(value)) return value.length === 0 ? "—" : value.every((entry) => typeof entry === "string" && entry.length < 30) ? value.join(", ") : `${value.length} items`;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// daftar perubahan per kolom: hanya yang berbeda (atau yang hanya ada di salah satu catatan)
export function diffRows(before: AuditLog["before"], after: AuditLog["after"]) {
  const keys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])];
  return keys
    .map((key) => ({ key, before: before?.[key], after: after?.[key] }))
    .filter((row) => !before || !after || JSON.stringify(row.before) !== JSON.stringify(row.after));
}

function Changes({ log }: { log: AuditLog }) {
  const rows = diffRows(log.before, log.after);
  if (rows.length === 0 && !log.reason) return <span className="text-ink-muted">—</span>;
  return (
    <details className="group">
      <summary className="cursor-pointer list-none text-sm font-medium text-primary underline-offset-2 hover:underline focus-visible:underline [&::-webkit-details-marker]:hidden">
        {rows.length} {rows.length === 1 ? "change" : "changes"}
        <span className="sr-only"> for {log.target.label ?? ENTITY_LABEL[log.entity]}</span>
      </summary>
      <dl className="mt-2 flex flex-col gap-1.5 rounded-lg bg-surface-muted p-3 text-xs">
        {rows.map((row) => (
          <div key={row.key} className="grid gap-0.5">
            <dt className="font-medium text-ink">{humanize(row.key)}</dt>
            <dd className="flex flex-wrap items-center gap-1.5 text-ink-muted [overflow-wrap:anywhere]">
              {log.before && (
                <>
                  <span>{formatValue(row.before)}</span>
                  <PiArrowRight aria-label="changed to" size={12} className="shrink-0" />
                </>
              )}
              <span className="text-ink">{formatValue(row.after)}</span>
            </dd>
          </div>
        ))}
        {log.reason && (
          <div className="grid gap-0.5">
            <dt className="font-medium text-ink">Reason</dt>
            <dd className="text-ink-muted">{log.reason}</dd>
          </div>
        )}
      </dl>
    </details>
  );
}

function Target({ log }: { log: AuditLog }) {
  const label = log.target.label ?? `Deleted ${ENTITY_LABEL[log.entity].toLowerCase()}`;
  return log.target.href ? (
    <Link href={log.target.href} className="font-medium text-ink underline-offset-2 hover:underline [overflow-wrap:anywhere]">
      {label}
    </Link>
  ) : (
    <span className={log.target.label ? "font-medium text-ink" : "text-ink-muted italic"}>{label}</span>
  );
}

const actorName = (log: AuditLog) => log.actor?.name ?? "System";

// riwayat perubahan admin (PRD §12): hanya baca. Filter jenis data / aksi / admin / tanggal di URL
export function AuditLogTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const entityParam = searchParams.get("entity");
  const params = {
    page: Math.max(1, Number(searchParams.get("page")) || 1),
    entity: isEntity(entityParam) ? entityParam : undefined,
    action: searchParams.get("action") || undefined,
    actorId: searchParams.get("actor") || undefined,
    from: isDate(searchParams.get("from")),
    to: isDate(searchParams.get("to")),
  };

  const { data, isPending, isError, error, isFetching, refetch } = useAuditLogs(params);
  const { data: filters } = useAuditLogFilters();
  const logs = data?.logs ?? [];
  const meta = data?.meta;
  const isFiltered = Boolean(params.entity || params.action || params.actorId || params.from || params.to);

  const updateParams = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in changes)) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const selectClass = "select select-sm h-10 w-full border-base-300 text-ink";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <div>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">Audit log</h1>
        <p className="mt-1 text-sm text-ink-muted">Every change made in the admin panel: prices, stock, order status, and more. Read only.</p>
      </div>

      <section aria-label="Filters" className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-[repeat(5,minmax(0,1fr))_auto] md:items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">Type</span>
          <select value={params.entity ?? ""} onChange={(event) => updateParams({ entity: event.target.value || undefined })} className={selectClass}>
            <option value="">All types</option>
            {ENTITIES.map((entity) => (
              <option key={entity} value={entity}>
                {ENTITY_LABEL[entity]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">Action</span>
          <select value={params.action ?? ""} onChange={(event) => updateParams({ action: event.target.value || undefined })} className={selectClass}>
            <option value="">All actions</option>
            {filters?.actions.map((action) => (
              <option key={action} value={action}>
                {actionLabel(action)}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-2 flex flex-col gap-1 md:col-span-1">
          <span className="text-xs font-medium text-ink-muted">Admin</span>
          <select value={params.actorId ?? ""} onChange={(event) => updateParams({ actor: event.target.value || undefined })} className={selectClass}>
            <option value="">All admins</option>
            {filters?.actors.map((actor) => (
              <option key={actor.id} value={actor.id}>
                {actor.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">From</span>
          <input
            type="date"
            value={params.from ?? ""}
            max={params.to}
            onChange={(event) => updateParams({ from: event.target.value || undefined })}
            className="input input-sm h-10 w-full border-base-300 text-ink"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">To</span>
          <input
            type="date"
            value={params.to ?? ""}
            min={params.from}
            onChange={(event) => updateParams({ to: event.target.value || undefined })}
            className="input input-sm h-10 w-full border-base-300 text-ink"
          />
        </label>
        {isFiltered && (
          <button type="button" onClick={() => router.replace(pathname)} className="btn btn-ghost btn-sm col-span-2 h-10 text-ink md:col-span-1">
            Clear filters
          </button>
        )}
      </section>

      <section aria-label="Audit log entries" aria-busy={isFetching} className={`mt-5 transition-opacity ${isFetching && !isPending ? "opacity-60" : ""}`}>
        {isPending && <div className="skeleton h-96 w-full" />}
        {isError && (
          <div className="flex flex-col gap-3">
            <FormAlert message={getErrorMessage(error, "Couldn't load the audit log.")} />
            <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
              Try again
            </button>
          </div>
        )}

        {data && logs.length === 0 && (
          <div className="card flex flex-col items-center gap-3 border border-dashed border-base-300 bg-base-100 px-6 py-14 text-center">
            {isFiltered ? <PiFunnelSimple aria-hidden="true" size={32} className="text-ink-muted" /> : <PiClipboardText aria-hidden="true" size={32} className="text-ink-muted" />}
            <p className="font-medium text-ink">{isFiltered ? "No changes match these filters" : "No changes recorded yet"}</p>
            {isFiltered && (
              <button type="button" onClick={() => router.replace(pathname)} className="btn btn-outline btn-sm h-10">
                Clear filters
              </button>
            )}
          </div>
        )}

        {logs.length > 0 && (
          <>
            {/* desktop: tabel */}
            <div className="card hidden overflow-x-auto border border-base-300 bg-base-100 md:block">
              <table className="table">
                <thead>
                  <tr className="text-ink-muted">
                    <th scope="col">When</th>
                    <th scope="col">Admin</th>
                    <th scope="col">Item</th>
                    <th scope="col">Action</th>
                    <th scope="col">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="align-top">
                      <td className="text-sm whitespace-nowrap text-ink-muted tabular-nums">{formatDateTimeWIB(log.createdAt)}</td>
                      <td className="text-sm text-ink">{actorName(log)}</td>
                      <td className="max-w-56 text-sm">
                        <span className="block text-xs text-ink-muted">{ENTITY_LABEL[log.entity] ?? humanize(log.entity)}</span>
                        <Target log={log} />
                      </td>
                      <td className="text-sm whitespace-nowrap text-ink">{actionLabel(log.action)}</td>
                      <td className="min-w-56 text-sm">
                        <Changes log={log} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile: kartu */}
            <ul className="flex flex-col gap-3 md:hidden">
              {logs.map((log) => (
                <li key={log.id} className="card gap-2 border border-base-300 bg-base-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 text-sm">
                      <span className="block text-xs text-ink-muted">{ENTITY_LABEL[log.entity] ?? humanize(log.entity)}</span>
                      <Target log={log} />
                    </div>
                    <span className="badge badge-sm shrink-0 border-none bg-surface-sunken text-ink">{actionLabel(log.action)}</span>
                  </div>
                  <p className="text-xs text-ink-muted tabular-nums">
                    {formatDateTimeWIB(log.createdAt)} · {actorName(log)}
                  </p>
                  <Changes log={log} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {meta && meta.totalPage > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-muted tabular-nums">
            Page {meta.page} of {meta.totalPage} · {meta.totalLogs} entries
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
    </div>
  );
}
