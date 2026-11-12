"use client";

import Link from "next/link";
import { useRef } from "react";
import { PiCaretRight, PiX } from "react-icons/pi";
import { FormAlert } from "@/components/form/formAlert";
import { getErrorMessage } from "@/lib/error.lib";
import { CatalogEmptyState } from "./components/catalogEmptyState";
import { CatalogFilterSider } from "./components/catalogFilterSider";
import { CatalogHeader } from "./components/catalogHeader";
import { CatalogPagination } from "./components/catalogPagination";
import { ProductGrid } from "./components/productGrid";
import { countActiveFilters, type TypeValue, useCatalogFilters } from "./hooks/useCatalogFilters";
import { CATALOG_PAGE_SIZE, useProducts } from "./hooks/useProducts";

const TYPE_CHIPS: { value: TypeValue | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "ready", label: "Ready Stock" },
  { value: "custom", label: "Custom Order" },
];

// halaman katalog (PRD §6.2, Figma 1:563 desktop & 1:3898 mobile)
export function ProductCatalogSection() {
  const { filters, setParams, goToPage } = useCatalogFilters();
  const { data, isPending, isError, error, isFetching, refetch } = useProducts(filters);
  const filterDialogRef = useRef<HTMLDialogElement>(null);

  const products = data?.products ?? [];
  const meta = data?.meta;
  const hasFilters = countActiveFilters(filters) > 0 || Boolean(filters.search);
  // key: input harga di panel filter di-reset kalau harga di URL berubah dari luar (chip / Clear all)
  const filterKey = `${filters.minPrice ?? ""}-${filters.maxPrice ?? ""}`;

  // empty state "Reset filters": hapus filter + kata kunci sekaligus (1x ganti URL)
  const resetAll = () =>
    setParams({ search: undefined, kategori: undefined, tipe: undefined, min: undefined, max: undefined, tersedia: undefined });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-ink-muted">
        <Link href="/" className="rounded hover:text-ink hover:underline">
          Home
        </Link>
        <PiCaretRight aria-hidden="true" size={12} />
        <span aria-current="page" className="text-ink">
          Catalog
        </span>
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
        {/* sidebar filter desktop */}
        <aside aria-label="Product filters" className="hidden rounded-box border border-base-300 bg-base-100 p-5 lg:sticky lg:top-24 lg:block">
          <CatalogFilterSider key={filterKey} />
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
          <CatalogHeader totalProducts={meta?.totalProducts} onOpenFilters={() => filterDialogRef.current?.showModal()} />

          {/* chip tipe produk versi HP (Figma mobile) */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none lg:hidden" role="group" aria-label="Product type">
            {TYPE_CHIPS.map((chip) => {
              const active = (filters.type ?? "") === chip.value;
              return (
                <button
                  key={chip.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setParams({ tipe: chip.value || undefined })}
                  className={`btn btn-sm h-9 shrink-0 rounded-full px-4 ${
                    active ? "btn-primary" : "border-base-300 bg-base-100 font-normal text-ink"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <section aria-label="Products" aria-busy={isFetching} className={isFetching && !isPending ? "opacity-60 transition-opacity" : ""}>
            <h2 className="sr-only">Products</h2>
            {isError ? (
              <div className="flex flex-col gap-3">
                <FormAlert message={getErrorMessage(error, "Couldn't load products.")} />
                <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
                  Try again
                </button>
              </div>
            ) : !isPending && products.length === 0 ? (
              <CatalogEmptyState hasFilters={hasFilters} onReset={resetAll} />
            ) : (
              <ProductGrid products={products} isLoading={isPending} />
            )}
          </section>

          {meta && meta.totalProducts > 0 && (
            <CatalogPagination
              page={meta.page}
              totalPage={meta.totalPage}
              totalProducts={meta.totalProducts}
              pageSize={CATALOG_PAGE_SIZE}
              onChange={goToPage}
            />
          )}
        </div>
      </div>

      {/* panel filter HP: bottom sheet (<dialog> bawaan -> fokus terkunci & Esc menutup) */}
      <dialog ref={filterDialogRef} aria-labelledby="filter-dialog-title" className="modal modal-bottom lg:hidden">
        <div className="modal-box max-h-[85dvh] p-0">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-base-300 bg-base-100 px-5 py-3">
            <h2 id="filter-dialog-title" className="text-base font-semibold text-ink">
              Filter products
            </h2>
            <form method="dialog">
              <button aria-label="Close filters" className="btn btn-ghost btn-square size-10">
                <PiX aria-hidden="true" size={20} />
              </button>
            </form>
          </div>
          <div className="px-5 py-4">
            <CatalogFilterSider key={filterKey} />
          </div>
          <div className="sticky bottom-0 border-t border-base-300 bg-base-100 px-5 py-3">
            <form method="dialog">
              <button className="btn btn-primary h-11 w-full">
                {meta ? `Show ${meta.totalProducts} ${meta.totalProducts === 1 ? "product" : "products"}` : "Show products"}
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close">close</button>
        </form>
      </dialog>
    </div>
  );
}
