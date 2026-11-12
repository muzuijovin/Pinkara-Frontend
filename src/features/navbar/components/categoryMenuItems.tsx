"use client";

import Link from "next/link";
import { categoryHref, useCategories } from "@/features/categories/hooks/useCategories";

// isi menu kategori dari BE, dipakai di dropdown desktop & menu mobile (<li> di dalam .menu daisyUI)
export function CategoryMenuItems() {
  const { data: categories = [], isPending, isError, refetch } = useCategories();

  if (isPending) {
    return (
      <li aria-busy="true" className="pointer-events-none">
        <span className="flex items-center gap-2 py-2.5 text-sm text-ink-muted">
          <span aria-hidden="true" className="loading loading-spinner loading-xs" />
          Loading categories...
        </span>
      </li>
    );
  }

  if (isError) {
    return (
      <li>
        <button type="button" onClick={() => refetch()} className="py-2.5 text-sm text-danger-text">
          Couldn&apos;t load categories. Tap to retry.
        </button>
      </li>
    );
  }

  if (!categories.length) {
    return (
      <li className="pointer-events-none">
        <span className="py-2.5 text-sm text-ink-muted">No categories yet</span>
      </li>
    );
  }

  return categories.map((category) => (
    <li key={category.id}>
      <Link
        href={categoryHref(category.slug)}
        className="flex items-center justify-between gap-3 py-2.5 text-sm text-ink"
      >
        {category.name}
        <span className="text-xs tabular-nums text-ink-muted">{category._count.products}</span>
      </Link>
    </li>
  ));
}
