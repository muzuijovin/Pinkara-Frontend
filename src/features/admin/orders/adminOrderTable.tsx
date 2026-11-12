"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PiCaretLeft, PiCaretRight, PiImageSquare, PiMagnifyingGlass, PiReceipt, PiStorefront, PiTruck } from "react-icons/pi";
import { useDebouncedCallback } from "use-debounce";
import { FormAlert } from "@/components/form/formAlert";
import { ORDER_STATUS, OrderStatusBadge } from "@/features/(costumer)/orders/constants/orderStatus";
import { formatRupiah } from "@/lib/currency.lib";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { AdminOrderListItem, OrderStatus } from "@/types/order.type";
import { useAdminOrders } from "./hooks/useAdminOrders";

// urutan tab mengikuti alur kerja penjual. Status khusus custom hanya tampil kalau ada isinya
const STATUS_TABS: OrderStatus[] = [
  "DIBAYAR",
  "DIPRODUKSI",
  "SIAP_KIRIM",
  "DIKEMAS",
  "DIKIRIM",
  "MENUNGGU_PEMBAYARAN",
  "PERLU_REFUND",
  "SELESAI",
  "DIBATALKAN",
  "KEDALUWARSA",
  "DIREFUND",
];
const OPTIONAL_TABS: OrderStatus[] = ["DIPRODUKSI", "SIAP_KIRIM", "DIREFUND"];
// tab yang butuh tindakan penjual -> angka diberi warna
const NEEDS_ACTION: OrderStatus[] = ["DIBAYAR", "DIKEMAS", "PERLU_REFUND"];

const isOrderStatus = (value: string | null): value is OrderStatus => Boolean(value && value in ORDER_STATUS);

function ItemSummary({ order }: { order: AdminOrderListItem }) {
  const item = order.firstItem;
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
        {item?.imageUrl ? (
          <Image src={item.imageUrl} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <PiImageSquare aria-hidden="true" size={18} className="text-ink-muted" />
        )}
      </span>
      <div className="min-w-0">
        <p className="line-clamp-1 font-medium text-ink">{item?.productName ?? "Order"}</p>
        <p className="text-xs text-ink-muted">
          {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
          {order.otherProducts > 0 && ` · +${order.otherProducts} more`}
        </p>
      </div>
    </div>
  );
}

function ShippingIcon({ method }: { method: AdminOrderListItem["shippingMethod"] }) {
  return method === "PICKUP" ? (
    <PiStorefront aria-label="Pick up" size={16} className="text-ink-muted" />
  ) : (
    <PiTruck aria-label="Delivery" size={16} className="text-ink-muted" />
  );
}

// daftar pesanan admin (PRD §12): tab status + jumlahnya, cari kode / nama / email, pagination. Filter di URL
export function AdminOrderTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const statusParam = searchParams.get("status");
  const status = isOrderStatus(statusParam) ? statusParam : undefined;

  const { data, isPending, isError, error, isFetching, refetch } = useAdminOrders({ page, status, search });
  const orders = data?.orders ?? [];
  const meta = data?.meta;
  const counts = meta?.statusCounts ?? {};
  const totalAll = Object.values(counts).reduce((total, count) => total + (count ?? 0), 0);

  const updateParams = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in changes)) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleSearch = useDebouncedCallback((value: string) => updateParams({ search: value.trim() || undefined }), 300);

  const tabs = STATUS_TABS.filter((tab) => !OPTIONAL_TABS.includes(tab) || (counts[tab] ?? 0) > 0 || status === tab);
  const isFiltered = Boolean(search || status);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <div>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-ink-muted">Pack, ship, and track every order in one place.</p>
      </div>

      <label className="input mt-6 h-11 w-full md:max-w-sm">
        <span className="sr-only">Search orders</span>
        <PiMagnifyingGlass aria-hidden="true" size={18} className="text-ink-muted" />
        <input
          type="search"
          key={search}
          defaultValue={search}
          onChange={(event) => handleSearch(event.target.value)}
          placeholder="Order number, customer name or email"
          className="grow text-base sm:text-sm"
        />
      </label>

      <nav aria-label="Filter by status" className="mt-4 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {[{ value: undefined, label: "All", count: totalAll }, ...tabs.map((tab) => ({ value: tab, label: ORDER_STATUS[tab].label, count: counts[tab] ?? 0 }))].map(
          (tab) => {
            const active = status === tab.value;
            const highlight = tab.value && NEEDS_ACTION.includes(tab.value) && tab.count > 0;
            return (
              <button
                key={tab.label}
                type="button"
                aria-pressed={active}
                onClick={() => updateParams({ status: tab.value })}
                className={`btn btn-sm h-9 shrink-0 gap-1.5 rounded-full px-4 ${
                  active ? "border-ink bg-ink text-base-100 hover:bg-ink" : "btn-ghost border-base-300 text-ink"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 text-xs tabular-nums ${
                    highlight && !active ? "bg-primary text-primary-content" : active ? "bg-base-100/20" : "bg-surface-sunken text-ink-muted"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          },
        )}
      </nav>

      <section
        aria-label="Order list"
        aria-busy={isFetching}
        className={`card mt-4 border border-base-300 bg-base-100 transition-opacity ${isFetching && !isPending ? "opacity-60" : ""}`}
      >
        {isPending && (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton h-14 w-full" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col gap-3 p-6">
            <FormAlert message={getErrorMessage(error, "Couldn't load orders.")} />
            <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
              Try again
            </button>
          </div>
        )}

        {!isPending && !isError && orders.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <PiReceipt aria-hidden="true" size={40} className="text-ink-muted" />
            <div>
              <p className="font-medium text-ink">{isFiltered ? "No orders match your filters" : "No orders yet"}</p>
              <p className="text-sm text-ink-muted">
                {isFiltered ? "Try another keyword or status." : "New orders will show up here."}
              </p>
            </div>
            {isFiltered && (
              <button type="button" onClick={() => router.replace(pathname)} className="btn btn-outline btn-sm h-10">
                Clear filters
              </button>
            )}
          </div>
        )}

        {orders.length > 0 && (
          <>
            {/* desktop: tabel */}
            <div className="hidden overflow-x-auto md:block">
              <table className="table">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-ink-muted">
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.code} className="hover:bg-surface-muted/60">
                      <td>
                        <p className="flex items-center gap-1.5 font-mono text-sm font-semibold text-ink">
                          {order.code}
                          <ShippingIcon method={order.shippingMethod} />
                        </p>
                        <p className="text-xs text-ink-muted">{formatDateTimeWIB(order.createdAt)}</p>
                      </td>
                      <td>
                        <p className="text-sm text-ink">{order.user.name}</p>
                        <p className="max-w-48 truncate text-xs text-ink-muted">{order.user.email}</p>
                      </td>
                      <td>
                        <ItemSummary order={order} />
                      </td>
                      <td className="whitespace-nowrap text-sm font-semibold tabular-nums text-ink">{formatRupiah(order.total)}</td>
                      <td>
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="text-right">
                        <Link href={`/admin/orders/${order.code}`} className="btn btn-ghost btn-sm h-9 text-ink">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* HP: kartu */}
            <ul className="divide-y divide-base-300 md:hidden">
              {orders.map((order) => (
                <li key={order.code}>
                  <Link href={`/admin/orders/${order.code}`} className="flex flex-col gap-3 p-4 transition-colors hover:bg-surface-muted/60">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="flex items-center gap-1.5 font-mono text-sm font-semibold text-ink">
                          {order.code}
                          <ShippingIcon method={order.shippingMethod} />
                        </p>
                        <p className="text-xs text-ink-muted">
                          {order.user.name} · {formatDateTimeWIB(order.createdAt)}
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <ItemSummary order={order} />
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">{formatRupiah(order.total)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {meta && meta.totalPage > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3">
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
