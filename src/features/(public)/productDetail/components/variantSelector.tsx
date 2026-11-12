import { formatRupiah } from "@/lib/currency.lib";
import type { ProductDetail } from "@/types/product.type";

type Variant = ProductDetail["variants"][number];

type VariantSelectorProps = {
  variants: Variant[];
  selectedId: string;
  onSelect: (variant: Variant) => void;
};

// pilih varian (PRD §6.3): mis. S/M/L/XL untuk Round Bouquet. Varian habis tetap tampil tapi tidak bisa dipilih
export function VariantSelector({ variants, selectedId, onSelect }: VariantSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">
        Size <span className="font-normal text-ink-muted">· {variants.find((v) => v.id === selectedId)?.label}</span>
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {variants.map((variant) => {
          const soldOut = variant.stock === 0;
          const selected = variant.id === selectedId;
          return (
            <label
              key={variant.id}
              className={`flex min-h-14 flex-col items-center justify-center rounded-box border px-3 py-2 text-center transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${
                soldOut
                  ? "cursor-not-allowed border-base-300 bg-surface-muted text-ink-muted"
                  : selected
                    ? "cursor-pointer border-primary bg-accent-soft/40 text-ink"
                    : "cursor-pointer border-base-300 text-ink hover:border-primary/60"
              }`}
            >
              <input
                type="radio"
                name="variant"
                value={variant.id}
                checked={selected}
                disabled={soldOut}
                onChange={() => onSelect(variant)}
                className="sr-only"
              />
              <span className={`text-sm font-semibold ${soldOut ? "line-through" : ""}`}>{variant.label}</span>
              <span className="text-xs tabular-nums">{soldOut ? "Sold out" : formatRupiah(variant.price)}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
