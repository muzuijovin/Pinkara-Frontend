import { PiFlowerLotus } from "react-icons/pi";

// hasil kosong (PRD §6.2): pesan + tombol "Reset filter"
export function CatalogEmptyState({ hasFilters, onReset }: { hasFilters: boolean; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-16 text-center">
      <PiFlowerLotus aria-hidden="true" size={44} className="text-ink-muted" />
      <div>
        <p className="font-semibold text-ink">{hasFilters ? "No products match your filters" : "No products yet"}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {hasFilters ? "Try another category, price range, or keyword." : "New arrangements are coming soon."}
        </p>
      </div>
      {hasFilters && (
        <button type="button" onClick={onReset} className="btn btn-primary h-11">
          Reset filters
        </button>
      )}
    </div>
  );
}
