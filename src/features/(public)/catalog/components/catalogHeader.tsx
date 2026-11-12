"use client";

import { PiFunnelSimple, PiMagnifyingGlass, PiX } from "react-icons/pi";
import { useDebouncedCallback } from "use-debounce";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { formatRupiah } from "@/lib/currency.lib";
import { SORT_OPTIONS, countActiveFilters, type SortValue, useCatalogFilters } from "../hooks/useCatalogFilters";

type CatalogHeaderProps = {
  totalProducts?: number;
  onOpenFilters: () => void; // panel filter versi HP
};

// judul + jumlah hasil, pencarian (debounce 300 ms, PRD §6.2), urutan, tombol filter HP & chip filter aktif
export function CatalogHeader({ totalProducts, onOpenFilters }: CatalogHeaderProps) {
  const { filters, setParams, toggleCategory, clearFilters } = useCatalogFilters();
  const { data: categories = [] } = useCategories();
  const activeCount = countActiveFilters(filters);

  const handleSearch = useDebouncedCallback(
    (value: string) => setParams({ search: value.trim() || undefined }),
    300,
  );

  const categoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name ?? slug;

  const priceLabel =
    filters.minPrice !== undefined && filters.maxPrice !== undefined
      ? `${formatRupiah(filters.minPrice)} – ${formatRupiah(filters.maxPrice)}`
      : filters.minPrice !== undefined
        ? `From ${formatRupiah(filters.minPrice)}`
        : filters.maxPrice !== undefined
          ? `Up to ${formatRupiah(filters.maxPrice)}`
          : undefined;

  const chips = [
    ...filters.categories.map((slug) => ({
      key: `cat-${slug}`,
      label: categoryName(slug),
      onRemove: () => toggleCategory(slug),
    })),
    ...(filters.type
      ? [{ key: "type", label: filters.type === "ready" ? "Ready stock" : "Custom order", onRemove: () => setParams({ tipe: undefined }) }]
      : []),
    ...(priceLabel ? [{ key: "price", label: priceLabel, onRemove: () => setParams({ min: undefined, max: undefined }) }] : []),
    ...(filters.inStock ? [{ key: "stock", label: "In stock only", onRemove: () => setParams({ tersedia: undefined }) }] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink md:text-3xl">Flower Catalog</h1>
          <p className="mt-1 text-sm text-ink-muted" aria-live="polite">
            {totalProducts === undefined
              ? "Fresh bouquets and arrangements, delivered across Greater Malang."
              : `${totalProducts} ${totalProducts === 1 ? "product" : "products"}${filters.search ? ` for "${filters.search}"` : ""}`}
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <span className="hidden sm:inline">Sort by</span>
          <span className="sr-only sm:hidden">Sort by</span>
          <select
            value={filters.sort}
            onChange={(event) => setParams({ urut: (event.target.value as SortValue) === "terbaru" ? undefined : event.target.value })}
            className="select select-sm h-10 w-auto min-w-44 text-base text-ink sm:text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-2">
        <label className="input h-11 w-full">
          <span className="sr-only">Search the catalog</span>
          <PiMagnifyingGlass aria-hidden="true" size={18} className="text-ink-muted" />
          <input
            type="search"
            // key: input ikut berubah kalau search di URL diganti dari luar (mis. search bar navbar)
            key={filters.search}
            defaultValue={filters.search}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search bouquets, bloom boxes, frames..."
            className="grow text-base sm:text-sm"
          />
        </label>
        <button
          type="button"
          onClick={onOpenFilters}
          className="btn btn-outline relative h-11 shrink-0 gap-2 border-base-300 text-ink lg:hidden"
        >
          <PiFunnelSimple aria-hidden="true" size={18} />
          Filter
          {activeCount > 0 && (
            <span className="badge badge-sm border-none bg-primary text-primary-content">{activeCount}</span>
          )}
        </button>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              aria-label={`Remove filter: ${chip.label}`}
              className="btn btn-sm h-8 gap-1 rounded-full border-base-300 bg-base-100 px-3 font-normal text-ink hover:border-primary hover:bg-accent-soft/40"
            >
              {chip.label}
              <PiX aria-hidden="true" size={14} />
            </button>
          ))}
          <button type="button" onClick={clearFilters} className="btn btn-link btn-sm h-8 px-1 text-accent-text">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
