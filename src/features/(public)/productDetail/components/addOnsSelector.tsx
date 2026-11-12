"use client";

import { PiMinus, PiPlus } from "react-icons/pi";
import { formatRupiah } from "@/lib/currency.lib";
import type { ProductAddon, ProductSize } from "@/types/product.type";
import { GiftCardForm, type GiftCardValue } from "./giftCardForm";

export const SIZE_RANK: Record<ProductSize, number> = { S: 0, M: 1, L: 2, XL: 3 };

export type AddonSelection = {
  packaging: { enabled: boolean; addonId: string | null };
  paperBag: { enabled: boolean; quantity: number };
  giftCard: { enabled: boolean } & GiftCardValue;
};

export const EMPTY_ADDONS: AddonSelection = {
  packaging: { enabled: false, addonId: null },
  paperBag: { enabled: false, quantity: 1 },
  giftCard: { enabled: false, message: "", senderName: "", anonymous: false },
};

// kardus yang boleh dipilih: ukuran >= ukuran produk (PRD §4.4: lebih kecil tidak bisa, lebih besar boleh)
export const packagingOptionsFor = (addons: ProductAddon[], productSize: ProductSize | null) =>
  productSize
    ? addons
        .filter((addon) => addon.type === "PACKAGING" && addon.size && SIZE_RANK[addon.size] >= SIZE_RANK[productSize])
        .sort((a, b) => SIZE_RANK[a.size!] - SIZE_RANK[b.size!])
    : [];

type AddOnsSelectorProps = {
  addons: ProductAddon[];
  productSize: ProductSize | null; // ukuran kardus yang cocok untuk varian terpilih; null = tidak pakai kardus
  quantity: number;
  value: AddonSelection;
  onChange: (value: AddonSelection) => void;
};

function AddonRow({
  title,
  description,
  price,
  checked,
  disabled,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  price: string;
  checked: boolean;
  disabled: boolean;
  onToggle: (checked: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <li className={`rounded-box border p-3 ${checked ? "border-primary/60 bg-accent-soft/20" : "border-base-300"}`}>
      <label className={`flex items-start gap-3 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onToggle(event.target.checked)}
          className="checkbox checkbox-primary checkbox-sm mt-0.5"
        />
        <span className="flex flex-1 flex-col">
          <span className="text-sm font-medium text-ink">{title}</span>
          <span className="text-xs text-ink-muted">{description}</span>
        </span>
        <span className="text-sm font-semibold tabular-nums text-accent-text">{price}</span>
      </label>
      {checked && children && <div className="mt-3 pl-8">{children}</div>}
    </li>
  );
}

// pilih add-on (PRD §4.4 & §6.3): kardus, paper bag, gift card. Stok habis -> abu-abu "Sold out"
export function AddOnsSelector({ addons, productSize, quantity, value, onChange }: AddOnsSelectorProps) {
  const packagingOptions = packagingOptionsFor(addons, productSize);
  const paperBag = addons.find((addon) => addon.type === "PAPER_BAG");
  const giftCard = addons.find((addon) => addon.type === "GIFT_CARD");
  const maxPaperBags = quantity + 2; // PRD §4.4

  if (!packagingOptions.length && !paperBag && !giftCard) return null;

  const firstAvailablePackaging = packagingOptions.find((addon) => addon.stock > 0);
  const selectedPackaging = packagingOptions.find((addon) => addon.id === value.packaging.addonId);

  return (
    <fieldset>
      <legend className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-ink">
        Add-ons <span className="text-xs font-normal text-ink-muted">Optional</span>
      </legend>
      <ul className="flex flex-col gap-2">
        {packagingOptions.length > 0 && (
          <AddonRow
            title="Packaging box"
            description={
              firstAvailablePackaging
                ? `Keeps your flowers safe in delivery · 1 box per item`
                : "All box sizes are sold out"
            }
            price={formatRupiah((selectedPackaging ?? firstAvailablePackaging ?? packagingOptions[0]).price)}
            checked={value.packaging.enabled}
            disabled={!firstAvailablePackaging}
            onToggle={(checked) =>
              onChange({
                ...value,
                // ukuran yang disarankan = ukuran produk (opsi pertama yang masih ada stok)
                packaging: { enabled: checked, addonId: checked ? (value.packaging.addonId ?? firstAvailablePackaging?.id ?? null) : null },
              })
            }
          >
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Box size">
              {packagingOptions.map((addon) => {
                const soldOut = addon.stock === 0;
                const active = addon.id === value.packaging.addonId;
                return (
                  <button
                    key={addon.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={soldOut}
                    onClick={() => onChange({ ...value, packaging: { enabled: true, addonId: addon.id } })}
                    className={`btn btn-sm h-10 min-w-16 flex-col gap-0 leading-tight ${
                      active ? "btn-primary" : "btn-outline border-base-300 text-ink"
                    }`}
                  >
                    <span>{addon.size}</span>
                    <span className="text-[10px] font-normal">{soldOut ? "Sold out" : formatRupiah(addon.price)}</span>
                  </button>
                );
              })}
            </div>
          </AddonRow>
        )}

        {paperBag && (
          <AddonRow
            title="Paper bag"
            description={paperBag.stock > 0 ? `Up to ${maxPaperBags} bags` : "Sold out"}
            price={formatRupiah(paperBag.price)}
            checked={value.paperBag.enabled}
            disabled={paperBag.stock === 0}
            onToggle={(checked) => onChange({ ...value, paperBag: { enabled: checked, quantity: 1 } })}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-ink-muted">Quantity</span>
              <div className="join">
                <button
                  type="button"
                  aria-label="Fewer paper bags"
                  disabled={value.paperBag.quantity <= 1}
                  onClick={() => onChange({ ...value, paperBag: { ...value.paperBag, quantity: value.paperBag.quantity - 1 } })}
                  className="btn join-item btn-sm size-10"
                >
                  <PiMinus aria-hidden="true" />
                </button>
                <span className="join-item flex w-10 items-center justify-center border-y border-base-300 text-sm tabular-nums" aria-live="polite">
                  {value.paperBag.quantity}
                </span>
                <button
                  type="button"
                  aria-label="More paper bags"
                  disabled={value.paperBag.quantity >= Math.min(maxPaperBags, paperBag.stock)}
                  onClick={() => onChange({ ...value, paperBag: { ...value.paperBag, quantity: value.paperBag.quantity + 1 } })}
                  className="btn join-item btn-sm size-10"
                >
                  <PiPlus aria-hidden="true" />
                </button>
              </div>
            </div>
          </AddonRow>
        )}

        {giftCard && (
          <AddonRow
            title="Gift card"
            description={giftCard.stock > 0 ? "Printed message, up to 200 characters" : "Sold out"}
            price={formatRupiah(giftCard.price)}
            checked={value.giftCard.enabled}
            disabled={giftCard.stock === 0}
            onToggle={(checked) => onChange({ ...value, giftCard: { ...value.giftCard, enabled: checked } })}
          >
            <GiftCardForm
              value={value.giftCard}
              onChange={(card) => onChange({ ...value, giftCard: { ...card, enabled: true } })}
            />
          </AddonRow>
        )}
      </ul>
    </fieldset>
  );
}
