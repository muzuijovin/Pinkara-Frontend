"use client";

import { useState, type FormEvent } from "react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { countActiveFilters, type TypeValue, useCatalogFilters } from "../hooks/useCatalogFilters";

const TYPE_OPTIONS: { value: TypeValue | ""; label: string }[] = [
  { value: "", label: "All products" },
  { value: "ready", label: "Ready stock" },
  { value: "custom", label: "Custom order" },
];

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2 border-t border-base-300 pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-2 text-sm font-semibold text-ink">{title}</legend>
      {children}
    </fieldset>
  );
}

// panel filter katalog (PRD §6.2): kategori (multi), tipe, rentang harga, sembunyikan yang habis.
// Dipakai di sidebar desktop & panel filter HP
export function CatalogFilterSider() {
  const { filters, setParams, toggleCategory, clearFilters } = useCatalogFilters();
  const { data: categories = [], isPending: isLoadingCategories } = useCategories();
  const activeCount = countActiveFilters(filters);

  // harga diterapkan lewat tombol Apply (bukan tiap ketik) supaya tidak fetch berkali-kali
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() ?? "");
  const priceError =
    minPrice && maxPrice && Number(minPrice) > Number(maxPrice) ? "Minimum can't be higher than maximum" : undefined;

  const applyPrice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (priceError) return;
    setParams({ min: minPrice || undefined, max: maxPrice || undefined });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
              clearFilters();
            }}
            className="btn btn-link btn-sm h-9 px-0 text-accent-text"
          >
            Reset
          </button>
        )}
      </div>

      <FilterGroup title="Category">
        {isLoadingCategories ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton h-6 w-full" />
            ))}
          </div>
        ) : (
          categories.map((category) => (
            <label key={category.id} className="flex min-h-9 cursor-pointer items-center gap-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={filters.categories.includes(category.slug)}
                onChange={() => toggleCategory(category.slug)}
                className="checkbox checkbox-primary checkbox-sm"
              />
              <span className="flex-1">{category.name}</span>
              <span className="text-xs tabular-nums text-ink-muted">{category._count.products}</span>
            </label>
          ))
        )}
      </FilterGroup>

      <FilterGroup title="Product type">
        {TYPE_OPTIONS.map((option) => (
          <label key={option.label} className="flex min-h-9 cursor-pointer items-center gap-3 text-sm text-ink">
            <input
              type="radio"
              name="catalog-type"
              checked={(filters.type ?? "") === option.value}
              onChange={() => setParams({ tipe: option.value || undefined })}
              className="radio radio-primary radio-sm"
            />
            {option.label}
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Price range (Rp)">
        <form onSubmit={applyPrice} noValidate className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              Min
              <input
                inputMode="numeric"
                placeholder="0"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value.replace(/\D/g, ""))}
                aria-invalid={priceError ? true : undefined}
                className="input input-sm h-10 w-full text-base tabular-nums text-ink sm:text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              Max
              <input
                inputMode="numeric"
                placeholder="Any"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value.replace(/\D/g, ""))}
                aria-invalid={priceError ? true : undefined}
                className="input input-sm h-10 w-full text-base tabular-nums text-ink sm:text-sm"
              />
            </label>
          </div>
          {priceError && (
            <p role="alert" className="text-xs text-danger-text">
              {priceError}
            </p>
          )}
          <button type="submit" disabled={Boolean(priceError)} className="btn btn-outline btn-sm h-10 w-full text-ink">
            Apply price
          </button>
        </form>
      </FilterGroup>

      <FilterGroup title="Availability">
        <label className="flex cursor-pointer items-start gap-3 rounded-box bg-surface-muted p-3">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(event) => setParams({ tersedia: event.target.checked ? "1" : undefined })}
            className="toggle toggle-primary toggle-sm mt-0.5"
          />
          <span className="flex flex-col">
            <span className="text-sm font-medium text-ink">Hide out of stock</span>
            <span className="text-xs text-ink-muted">Custom orders always stay visible.</span>
          </span>
        </label>
      </FilterGroup>
    </div>
  );
}
