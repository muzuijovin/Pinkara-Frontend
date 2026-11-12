"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PiCaretLeft, PiCaretRight, PiImageSquare, PiMagnifyingGlass, PiPackage, PiPencilSimple, PiPlus, PiStarFill } from "react-icons/pi";
import { useDebouncedCallback } from "use-debounce";
import { FormAlert } from "@/components/form/formAlert";
import { formatPriceRange } from "@/lib/currency.lib";
import { formatDateWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { AdminProductListItem, ProductStatus } from "@/types/product.type";
import { useAdminProducts } from "./hooks/useAdminProducts";

const STATUS_TABS: { value: ProductStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "INACTIVE", label: "Inactive" },
];

const STATUS_BADGE: Record<ProductStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-success-soft text-success-text" },
  DRAFT: { label: "Draft", className: "bg-surface-sunken text-ink-muted" },
  INACTIVE: { label: "Inactive", className: "bg-danger-soft text-danger-text" },
};

const isProductStatus = (value: string | null): value is ProductStatus =>
  value === "ACTIVE" || value === "DRAFT" || value === "INACTIVE";

function ProductThumb({ product }: { product: AdminProductListItem }) {
  const cover = product.images[0];
  return (
    <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
      {cover ? (
        <Image src={cover} alt="" fill sizes="48px" className="object-cover" />
      ) : (
        <PiImageSquare aria-hidden="true" size={20} className="text-ink-muted" />
      )}
    </span>
  );
}

function StockText({ product }: { product: AdminProductListItem }) {
  if (product.totalStock === null) return <span className="text-ink-muted">—</span>;
  if (product.totalStock === 0) return <span className="font-medium text-danger-text">Out of stock</span>;
  return <span className="tabular-nums text-ink">{product.totalStock}</span>;
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const { label, className } = STATUS_BADGE[status];
  return <span className={`badge badge-sm border-none font-medium ${className}`}>{label}</span>;
}

// daftar produk panel admin (PRD §12.1a): cari, filter status, pagination. Filter disimpan di URL
export function ProductTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const statusParam = searchParams.get("status");
  const status = isProductStatus(statusParam) ? statusParam : undefined;

  const { data, isPending, isError, error, isFetching, refetch } = useAdminProducts({ page, search, status });
  const products = data?.products ?? [];
  const meta = data?.meta;

  // ubah query URL; filter baru selalu kembali ke halaman 1
  const updateParams = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in changes)) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // PRD §6.2: pencarian debounce 300 ms
  const handleSearch = useDebouncedCallback((value: string) => updateParams({ search: value.trim() || undefined }), 300);

  const isFiltered = Boolean(search || status);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink md:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {meta ? `${meta.totalProducts} ${meta.totalProducts === 1 ? "product" : "products"}` : "Manage your catalog"}
          </p>
        </div>
        <Link href="/admin/products/create" className="btn btn-primary h-11 gap-2">
          <PiPlus aria-hidden="true" size={18} />
          Add product
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav aria-label="Filter by status" className="flex gap-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
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

        <label className="input h-11 w-full md:max-w-xs">
          <span className="sr-only">Search products</span>
          <PiMagnifyingGlass aria-hidden="true" size={18} className="text-ink-muted" />
          <input
            type="search"
            // key: input di-reset kalau search di URL berubah dari luar (mis. tombol Clear filters)
            key={search}
            defaultValue={search}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search by product name"
            className="grow text-base sm:text-sm"
          />
        </label>
      </div>

      <section
        aria-label="Product list"
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
            <FormAlert message={getErrorMessage(error, "Couldn't load products.")} />
            <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
              Try again
            </button>
          </div>
        )}

        {!isPending && !isError && products.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <PiPackage aria-hidden="true" size={40} className="text-ink-muted" />
            <div>
              <p className="font-medium text-ink">{isFiltered ? "No products match your filters" : "No products yet"}</p>
              <p className="text-sm text-ink-muted">
                {isFiltered ? "Try another keyword or status." : "Add your first product to start selling."}
              </p>
            </div>
            {isFiltered ? (
              <button type="button" onClick={() => router.replace(pathname)} className="btn btn-outline btn-sm h-10">
                Clear filters
              </button>
            ) : (
              <Link href="/admin/products/create" className="btn btn-primary btn-sm h-10 gap-1.5">
                <PiPlus aria-hidden="true" size={16} />
                Add product
              </Link>
            )}
          </div>
        )}

        {products.length > 0 && (
          <>
            {/* desktop: tabel */}
            <div className="hidden overflow-x-auto md:block">
              <table className="table">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-ink-muted">
                    <th>Product</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-surface-muted/60">
                      <td>
                        <div className="flex items-center gap-3">
                          <ProductThumb product={product} />
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 font-medium text-ink">
                              <span className="line-clamp-1">{product.name}</span>
                              {product.isFeatured && (
                                <PiStarFill aria-label="Featured" size={14} className="shrink-0 text-warning" />
                              )}
                            </p>
                            <p className="text-xs text-ink-muted">{product.category.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm text-ink">{product.type === "READY" ? "Ready stock" : "Custom"}</td>
                      <td className="whitespace-nowrap text-sm tabular-nums text-ink">
                        {product.type === "CUSTOM" && <span className="text-ink-muted">From </span>}
                        {formatPriceRange(product.minPrice, product.maxPrice)}
                      </td>
                      <td className="text-sm">
                        <StockText product={product} />
                      </td>
                      <td>
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="whitespace-nowrap text-sm text-ink-muted">{formatDateWIB(product.updatedAt)}</td>
                      <td className="text-right">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          aria-label={`Edit ${product.name}`}
                          className="btn btn-ghost btn-sm h-9 gap-1.5 text-ink"
                        >
                          <PiPencilSimple aria-hidden="true" size={16} />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* HP: kartu, supaya tidak perlu scroll ke samping */}
            <ul className="divide-y divide-base-300 md:hidden">
              {products.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="flex gap-3 p-4 transition-colors hover:bg-surface-muted/60"
                  >
                    <ProductThumb product={product} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 font-medium text-ink">{product.name}</p>
                        <StatusBadge status={product.status} />
                      </div>
                      <p className="text-xs text-ink-muted">
                        {product.category.name} · {product.type === "READY" ? "Ready stock" : "Custom"}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className="tabular-nums text-ink">
                          {formatPriceRange(product.minPrice, product.maxPrice)}
                        </span>
                        <span className="text-xs">
                          Stock: <StockText product={product} />
                        </span>
                      </div>
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
