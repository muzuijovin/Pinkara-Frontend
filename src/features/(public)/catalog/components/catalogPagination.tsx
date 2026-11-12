"use client";

import { PiCaretLeft, PiCaretRight } from "react-icons/pi";

// nomor halaman yang tampil: 1 … 4 5 6 … 12 (halaman sekarang ± 1, plus awal & akhir)
function pageItems(current: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  return sorted.flatMap((page, index) => (index > 0 && page - sorted[index - 1] > 1 ? ["gap" as const, page] : [page]));
}

type CatalogPaginationProps = {
  page: number;
  totalPage: number;
  totalProducts: number;
  pageSize: number;
  onChange: (page: number) => void;
};

export function CatalogPagination({ page, totalPage, totalProducts, pageSize, onChange }: CatalogPaginationProps) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalProducts);

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-ink-muted">
        Showing <span className="font-medium text-ink">{from}–{to}</span> of {totalProducts} products
      </p>

      {totalPage > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onChange(page - 1)}
            aria-label="Previous page"
            className="btn btn-ghost btn-square size-10"
          >
            <PiCaretLeft aria-hidden="true" size={18} />
          </button>
          {pageItems(page, totalPage).map((item, index) =>
            item === "gap" ? (
              <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-ink-muted">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onChange(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={`btn btn-square size-10 tabular-nums ${
                  item === page ? "btn-primary" : "btn-ghost text-ink"
                }`}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={page >= totalPage}
            onClick={() => onChange(page + 1)}
            aria-label="Next page"
            className="btn btn-ghost btn-square size-10"
          >
            <PiCaretRight aria-hidden="true" size={18} />
          </button>
        </div>
      )}
    </nav>
  );
}
