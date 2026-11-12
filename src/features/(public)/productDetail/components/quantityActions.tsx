import { PiLightning, PiMinus, PiPlus, PiShoppingCartSimple } from "react-icons/pi";
import { formatRupiah } from "@/lib/currency.lib";

type QuantityActionsProps = {
  quantity: number;
  maxQuantity: number;
  total: number;
  disabled: boolean; // stok habis / form add-on belum valid
  disabledReason?: string;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
};

// jumlah (maks = stok) + "Add to cart · Rp…" & "Buy now" (PRD §6.3: total ikut harga add-on)
export function QuantityActions({
  quantity,
  maxQuantity,
  total,
  disabled,
  disabledReason,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
}: QuantityActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink">Quantity</span>
        <div className="join">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => onQuantityChange(quantity - 1)}
            className="btn join-item size-11"
          >
            <PiMinus aria-hidden="true" />
          </button>
          <span
            aria-live="polite"
            aria-label={`Quantity ${quantity}`}
            className="join-item flex w-12 items-center justify-center border-y border-base-300 text-base font-semibold tabular-nums"
          >
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={quantity >= maxQuantity}
            onClick={() => onQuantityChange(quantity + 1)}
            className="btn join-item size-11"
          >
            <PiPlus aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <button type="button" disabled={disabled} onClick={onAddToCart} className="btn btn-primary h-12 gap-2 text-[15px]">
          <PiShoppingCartSimple aria-hidden="true" size={20} />
          Add to cart · <span className="tabular-nums">{formatRupiah(total)}</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onBuyNow}
          className="btn btn-outline btn-primary h-12 gap-2 text-[15px]"
        >
          <PiLightning aria-hidden="true" size={18} />
          Buy now
        </button>
      </div>
      {disabledReason && <p className="text-xs text-danger-text">{disabledReason}</p>}
    </div>
  );
}
