"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PiCaretLeft, PiCaretRight, PiImageSquare, PiReceipt } from "react-icons/pi";
import { FormAlert } from "@/components/form/formAlert";
import { formatRupiah } from "@/lib/currency.lib";
import { formatDateTimeWIB, formatDateWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { OrderListItem, OrderTab } from "@/types/order.type";
import { OrderStatusBadge } from "./constants/orderStatus";
import { useOrders } from "./hooks/useOrder";

const TABS: { value: OrderTab | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const isOrderTab = (value: string | null): value is OrderTab =>
  value === "active" || value === "completed" || value === "cancelled";

function OrderCard({ order }: { order: OrderListItem }) {
  const isAwaitingPayment = order.status === "MENUNGGU_PEMBAYARAN";
  const detailHref = `/orders/${order.code}`;
  const item = order.firstItem;

  return (
    <li className="card border border-base-300 bg-base-100">
      <div className="card-body gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-ink-muted">
            {formatDateWIB(order.createdAt)} · <span className="font-mono text-ink">{order.code}</span>
          </p>
          <OrderStatusBadge status={order.status} />
        </div>

        <Link href={detailHref} className="flex gap-3 rounded-lg transition-colors hover:bg-surface-muted/60">
          <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
            {item?.imageUrl ? (
              <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />
            ) : (
              <PiImageSquare aria-hidden="true" size={20} className="absolute inset-0 m-auto text-ink-muted" />
            )}
          </span>
          <div className="min-w-0 flex-1 self-center">
            <p className="line-clamp-1 font-semibold text-ink">{item?.productName ?? "Order"}</p>
            <p className="text-sm text-ink-muted">
              {item?.variantLabel && item.variantLabel !== "Default" && <>Size {item.variantLabel} · </>}
              {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
              {order.otherProducts > 0 && ` · +${order.otherProducts} more ${order.otherProducts === 1 ? "product" : "products"}`}
            </p>
          </div>
        </Link>

        <div className="flex flex-col gap-3 border-t border-base-300 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-ink-muted">Total</p>
            <p className="font-bold tabular-nums text-ink">{formatRupiah(order.total)}</p>
            {isAwaitingPayment && (
              <p className="text-xs text-danger-text">Pay before {formatDateTimeWIB(order.expiresAt)}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={detailHref} className="btn btn-outline h-10 flex-1 border-base-300 text-ink sm:flex-none">
              View details
            </Link>
            {isAwaitingPayment && (
              <Link href={`${detailHref}/payment`} className="btn btn-primary h-10 flex-1 sm:flex-none">
                Pay now
              </Link>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

// Pesanan Saya (PRD §6.4): tab status & halaman disimpan di URL (?status=active&page=2)
export function OrderList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const statusParam = searchParams.get("status");
  const status = isOrderTab(statusParam) ? statusParam : undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const { data, isPending, isError, error, isFetching, refetch } = useOrders({ status, page });
  const orders = data?.orders ?? [];
  const meta = data?.meta;

  const updateParams = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in changes)) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <h1 className="text-2xl font-bold text-ink md:text-3xl">My orders</h1>

      <nav aria-label="Filter orders" className="mt-5 flex gap-1 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const active = (status ?? "") === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              aria-pressed={active}
              onClick={() => updateParams({ status: tab.value || undefined })}
              className={`btn btn-sm h-9 shrink-0 rounded-full px-4 ${
                active ? "border-ink bg-ink text-base-100 hover:bg-ink" : "btn-ghost border-base-300 text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <section
        aria-label="Orders"
        aria-busy={isFetching}
        className={`mt-5 transition-opacity ${isFetching && !isPending ? "opacity-60" : ""}`}
      >
        {isPending && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-44 w-full" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col gap-3">
            <FormAlert message={getErrorMessage(error, "Couldn't load your orders.")} />
            <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
              Try again
            </button>
          </div>
        )}

        {!isPending && !isError && orders.length === 0 && (
          <div className="card border border-base-300 bg-base-100">
            <div className="card-body items-center gap-3 px-6 py-14 text-center">
              <PiReceipt aria-hidden="true" size={44} className="text-ink-muted" />
              <div>
                <h2 className="text-lg font-semibold text-ink">{status ? "No orders here yet" : "No orders yet"}</h2>
                <p className="text-sm text-ink-muted">
                  {status ? "Try another tab." : "When you place an order, you'll find it here."}
                </p>
              </div>
              {!status && (
                <Link href="/products" className="btn btn-primary h-11">
                  Browse the catalog
                </Link>
              )}
            </div>
          </div>
        )}

        {orders.length > 0 && (
          <ul className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard key={order.code} order={order} />
            ))}
          </ul>
        )}
      </section>

      {meta && meta.totalPage > 1 && (
        <nav aria-label="Pagination" className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">
            Page {meta.page} of {meta.totalPage}
          </p>
          <div className="join">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
              className="btn join-item h-10 gap-1"
            >
              <PiCaretLeft aria-hidden="true" size={16} />
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPage}
              onClick={() => updateParams({ page: String(page + 1) })}
              className="btn join-item h-10 gap-1"
            >
              Next
              <PiCaretRight aria-hidden="true" size={16} />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
