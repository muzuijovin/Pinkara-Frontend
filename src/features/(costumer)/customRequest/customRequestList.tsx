"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PiCaretLeft, PiCaretRight, PiChatsCircle, PiFlowerTulip, PiPlus } from "react-icons/pi";
import { FormAlert } from "@/components/form/formAlert";
import { formatRupiah } from "@/lib/currency.lib";
import { formatDateWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { CustomRequestListItem, CustomRequestStatus } from "@/types/customRequest.type";
import { REQUEST_STATUS, RequestStatusBadge } from "./constants/requestStatus";
import { useCustomRequests } from "./hooks/useCustomRequests";

const TABS: { value?: CustomRequestStatus; label: string }[] = [
  { label: "All" },
  { value: "DISKUSI", label: REQUEST_STATUS.DISKUSI.label },
  { value: "PENAWARAN_DIKIRIM", label: REQUEST_STATUS.PENAWARAN_DIKIRIM.label },
  { value: "DISETUJUI", label: REQUEST_STATUS.DISETUJUI.label },
  { value: "DIBATALKAN", label: REQUEST_STATUS.DIBATALKAN.label },
];
const isStatus = (value: string | null): value is CustomRequestStatus => Boolean(value && value in REQUEST_STATUS);

function RequestCard({ request }: { request: CustomRequestListItem }) {
  const thumb = request.referenceImages[0] ?? request.product?.images[0];
  const quote = request.latestQuotation;
  return (
    <li>
      <Link
        href={`/custom-requests/${request.code}`}
        className="card flex-row gap-4 border border-base-300 bg-base-100 p-4 transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent-soft">
          {thumb ? <Image src={thumb} alt="" fill sizes="64px" className="object-cover" /> : <PiFlowerTulip aria-hidden="true" size={24} className="text-primary" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="line-clamp-1 font-semibold text-ink">{request.product?.name ?? `${request.brief.size} · ${request.brief.colors}`}</p>
            <RequestStatusBadge status={request.status} />
          </div>
          <p className="line-clamp-1 text-sm text-ink-muted">{request.brief.flowers}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
            <span>Needed by {formatDateWIB(request.neededBy)}</span>
            {quote?.status === "ACTIVE" && <span className="font-semibold text-accent-text">Quote: {formatRupiah(quote.total)}</span>}
            {request.unreadCount > 0 && (
              <span className="badge badge-sm border-none bg-primary text-primary-content">
                {request.unreadCount} new {request.unreadCount === 1 ? "message" : "messages"}
              </span>
            )}
          </p>
        </div>
      </Link>
    </li>
  );
}

// daftar pengajuan custom milik pembeli (tab status di URL)
export function CustomRequestList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const status = isStatus(statusParam) ? statusParam : undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const { data, isPending, isError, error, refetch, isFetching } = useCustomRequests({ page, status });

  const setParams = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in changes)) next.delete("page");
    router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">My custom requests</h1>
          <p className="mt-1 text-sm text-ink-muted">Chat with our florist and review your quotes.</p>
        </div>
        <Link href="/custom-requests/new" className="btn btn-primary h-11 gap-2">
          <PiPlus aria-hidden="true" size={18} />
          New request
        </Link>
      </div>

      <nav aria-label="Filter requests" className="mt-5 flex gap-1 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const active = status === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              aria-pressed={active}
              onClick={() => setParams({ status: tab.value })}
              className={`btn btn-sm h-9 shrink-0 rounded-full px-4 ${active ? "border-ink bg-ink text-base-100 hover:bg-ink" : "btn-ghost border-base-300 text-ink"}`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <section aria-label="Requests" aria-busy={isFetching} className="mt-5">
        {isPending && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-24 w-full" />
            ))}
          </div>
        )}
        {isError && (
          <div className="flex flex-col gap-3">
            <FormAlert message={getErrorMessage(error, "Couldn't load your requests.")} />
            <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
              Try again
            </button>
          </div>
        )}
        {data && data.requests.length === 0 && (
          <div className="card border border-base-300 bg-base-100">
            <div className="card-body items-center gap-3 px-6 py-14 text-center">
              <PiChatsCircle aria-hidden="true" size={44} className="text-ink-muted" />
              <div>
                <h2 className="text-lg font-semibold text-ink">{status ? "Nothing here yet" : "No custom requests yet"}</h2>
                <p className="text-sm text-ink-muted">Have an idea? Send a brief and our florist will make it real.</p>
              </div>
              <Link href="/custom-requests/new" className="btn btn-primary h-11">
                Start a custom request
              </Link>
            </div>
          </div>
        )}
        {data && data.requests.length > 0 && (
          <ul className="flex flex-col gap-3">
            {data.requests.map((request) => (
              <RequestCard key={request.code} request={request} />
            ))}
          </ul>
        )}
      </section>

      {data && data.meta.totalPage > 1 && (
        <nav aria-label="Pagination" className="mt-5 flex items-center justify-between gap-3">
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
