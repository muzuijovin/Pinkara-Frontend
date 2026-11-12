"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PiCaretLeft, PiCaretRight, PiChatsCircle, PiFlowerTulip, PiMagnifyingGlass } from "react-icons/pi";
import { useDebouncedCallback } from "use-debounce";
import { FormAlert } from "@/components/form/formAlert";
import { REQUEST_STATUS, RequestStatusBadge } from "@/features/(costumer)/customRequest/constants/requestStatus";
import { formatRupiah } from "@/lib/currency.lib";
import { formatDateTimeWIB, formatDateWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { CustomRequestStatus } from "@/types/customRequest.type";
import { useAdminCustomRequests } from "./hooks/useAdminCustomRequests";

const STATUSES: CustomRequestStatus[] = ["DISKUSI", "PENAWARAN_DIKIRIM", "DISETUJUI", "DIBATALKAN"];
const isStatus = (value: string | null): value is CustomRequestStatus => Boolean(value && value in REQUEST_STATUS);

// inbox diskusi custom (PRD §12): perlu dibalas disorot, tab status + jumlah, cari kode / nama / email
export function CustomRequestInbox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const status = isStatus(statusParam) ? statusParam : undefined;
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const { data, isPending, isError, error, refetch } = useAdminCustomRequests({ page, status, search });
  const counts = data?.meta.statusCounts ?? {};

  const setParams = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in changes)) next.delete("page");
    router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
  };
  const handleSearch = useDebouncedCallback((value: string) => setParams({ search: value.trim() || undefined }), 300);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-ink md:text-3xl">Custom requests</h1>
      <p className="mt-1 text-sm text-ink-muted">Reply to customers, send quotes, and turn ideas into orders.</p>

      <label className="input mt-6 h-11 w-full md:max-w-sm">
        <span className="sr-only">Search requests</span>
        <PiMagnifyingGlass aria-hidden="true" size={18} className="text-ink-muted" />
        <input
          type="search"
          key={search}
          defaultValue={search}
          onChange={(event) => handleSearch(event.target.value)}
          placeholder="Request code, customer name or email"
          className="grow text-base sm:text-sm"
        />
      </label>

      <nav aria-label="Filter by status" className="mt-4 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {[{ value: undefined, label: "All", count: Object.values(counts).reduce((a, b) => a + (b ?? 0), 0) }, ...STATUSES.map((value) => ({ value, label: REQUEST_STATUS[value].label, count: counts[value] ?? 0 }))].map(
          (tab) => {
            const active = status === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                aria-pressed={active}
                onClick={() => setParams({ status: tab.value })}
                className={`btn btn-sm h-9 shrink-0 gap-1.5 rounded-full px-4 ${active ? "border-ink bg-ink text-base-100 hover:bg-ink" : "btn-ghost border-base-300 text-ink"}`}
              >
                {tab.label}
                <span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? "bg-base-100/20" : "bg-surface-sunken text-ink-muted"}`}>{tab.count}</span>
              </button>
            );
          },
        )}
      </nav>

      <section aria-label="Requests" className="mt-4">
        {isPending && <div className="skeleton h-64 w-full" />}
        {isError && (
          <div className="flex flex-col gap-3">
            <FormAlert message={getErrorMessage(error, "Couldn't load requests.")} />
            <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
              Try again
            </button>
          </div>
        )}
        {data && data.requests.length === 0 && (
          <div className="card border border-base-300 bg-base-100">
            <div className="card-body items-center gap-2 py-14 text-center">
              <PiChatsCircle aria-hidden="true" size={40} className="text-ink-muted" />
              <p className="font-medium text-ink">No requests here</p>
            </div>
          </div>
        )}
        {data && data.requests.length > 0 && (
          <ul className="card divide-y divide-base-300 border border-base-300 bg-base-100">
            {data.requests.map((request) => {
              const thumb = request.referenceImages[0] ?? request.product?.images[0];
              return (
                <li key={request.code}>
                  <Link
                    href={`/admin/custom-requests/${request.code}`}
                    className={`flex gap-4 p-4 transition-colors hover:bg-surface-muted/60 ${request.needsReply ? "bg-accent-soft/30" : ""}`}
                  >
                    <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent-soft">
                      {thumb ? <Image src={thumb} alt="" fill sizes="56px" className="object-cover" /> : <PiFlowerTulip aria-hidden="true" size={22} className="text-primary" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-ink">{request.user?.name}</p>
                        <RequestStatusBadge status={request.status} />
                        {request.needsReply && <span className="badge badge-sm border-none bg-primary font-semibold text-primary-content">Needs reply</span>}
                        {request.unreadCount > 0 && <span className="text-xs font-semibold text-accent-text">{request.unreadCount} unread</span>}
                      </div>
                      <p className="line-clamp-1 text-sm text-ink-muted">
                        {request.product?.name ?? request.category?.name ?? "Custom"} · {request.brief.size} · {request.brief.colors}
                      </p>
                      <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-ink-muted">
                        <span className="font-mono">{request.code}</span>
                        <span>Needed by {formatDateWIB(request.neededBy)}</span>
                        {request.latestQuotation?.status === "ACTIVE" && <span>Quote {formatRupiah(request.latestQuotation.total)}</span>}
                        <span>Updated {formatDateTimeWIB(request.updatedAt)}</span>
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {data && data.meta.totalPage > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">
            Page {data.meta.page} of {data.meta.totalPage}
          </p>
          <div className="join">
            <button type="button" disabled={page <= 1} onClick={() => setParams({ page: String(page - 1) })} className="btn join-item h-10 gap-1">
              <PiCaretLeft aria-hidden="true" size={16} />
              Previous
            </button>
            <button type="button" disabled={page >= data.meta.totalPage} onClick={() => setParams({ page: String(page + 1) })} className="btn join-item h-10 gap-1">
              Next
              <PiCaretRight aria-hidden="true" size={16} />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
