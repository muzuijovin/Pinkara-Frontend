"use client";

import Image from "next/image";
import Link from "next/link";
import { PiGift, PiImageSquare, PiMinus, PiPackage, PiPlus, PiShoppingBag, PiTrash, PiWarningCircle } from "react-icons/pi";
import { toast } from "react-toastify";
import { formatRupiah } from "@/lib/currency.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { CartAddonLine, CartItem } from "@/types/cart.type";
import { useRemoveCartItem, useUpdateCartItem } from "../hooks/useCart";

const ADDON_ICON = { PACKAGING: PiPackage, PAPER_BAG: PiShoppingBag, GIFT_CARD: PiGift } as const;

// pesan & tindakan untuk baris yang tidak bisa di-checkout
function issueMessage(item: CartItem) {
  switch (item.issue) {
    case "UNAVAILABLE":
      return "This product is no longer available. Remove it to continue.";
    case "OUT_OF_STOCK":
      return "This item is out of stock. Remove it to continue.";
    case "INSUFFICIENT_STOCK":
      return `Only ${item.variant.stock} left in stock. Lower the quantity to continue.`;
    case "ADDON_UNAVAILABLE":
      return "An add-on for this item is sold out. Remove the item and add it again with other add-ons.";
    default:
      return null;
  }
}

function AddonDescription({ addon }: { addon: CartAddonLine }) {
  if (addon.type === "GIFT_CARD") {
    const from = addon.hideSender ? "Anonymous" : addon.senderName ? `From ${addon.senderName}` : null;
    return (
      <span className="flex min-w-0 flex-col">
        <span>Gift card</span>
        <span className="text-ink-muted wrap-break-word">
          {addon.giftMessage ? `“${addon.giftMessage}”` : "Blank card"}
          {from && ` · ${from}`}
        </span>
      </span>
    );
  }
  return (
    <span>
      {addon.type === "PACKAGING" ? `Packaging box ${addon.size ?? ""}` : "Paper bag"} × {addon.quantity}
    </span>
  );
}

// 1 baris keranjang: foto, nama, varian, add-on, jumlah, total baris
export function CartItemCard({ item }: { item: CartItem }) {
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
  const isBusy = isUpdating || isRemoving;
  const message = issueMessage(item);
  const isUnavailable = item.issue === "UNAVAILABLE" || item.issue === "OUT_OF_STOCK";
  const productHref = `/products/${item.product.slug}`;

  const changeQuantity = (quantity: number) =>
    updateItem(
      { id: item.id, quantity },
      { onError: (error) => toast.error(getErrorMessage(error, "Couldn't update the quantity.")) },
    );

  const remove = () =>
    removeItem(item.id, {
      onSuccess: () => toast.success(`"${item.product.name}" was removed from your cart.`),
      onError: (error) => toast.error(getErrorMessage(error, "Couldn't remove the item.")),
    });

  return (
    <li
      aria-busy={isBusy}
      className={`flex flex-col gap-3 p-4 transition-opacity sm:p-5 ${isBusy ? "opacity-60" : ""}`}
    >
      <div className="flex gap-4">
        <Link
          href={productHref}
          tabIndex={-1}
          aria-hidden="true"
          className={`relative size-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:size-24 ${isUnavailable ? "grayscale" : ""}`}
        >
          {item.product.image ? (
            <Image src={item.product.image} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <PiImageSquare size={24} className="absolute inset-0 m-auto text-ink-muted" />
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={productHref} className="line-clamp-2 font-semibold text-ink hover:underline">
                {item.product.name}
              </Link>
              <p className="text-sm text-ink-muted">
                {item.variant.label !== "Default" && <>Size {item.variant.label} · </>}
                <span className="tabular-nums">{formatRupiah(item.variant.price)}</span>
              </p>
            </div>
            <p className="shrink-0 text-right font-semibold tabular-nums text-ink">{formatRupiah(item.lineTotal)}</p>
          </div>

          {item.addons.length > 0 && (
            <ul className="mt-1 flex flex-col gap-1.5 text-xs text-ink">
              {item.addons.map((addon) => {
                const Icon = ADDON_ICON[addon.type];
                return (
                  <li key={addon.id} className="flex items-start gap-2">
                    <Icon aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-ink-muted" />
                    <span className="flex min-w-0 flex-1 justify-between gap-3">
                      <AddonDescription addon={addon} />
                      <span className={`shrink-0 tabular-nums ${addon.isAvailable ? "text-ink-muted" : "text-danger-text"}`}>
                        {addon.isAvailable ? formatRupiah(addon.subtotal) : "Sold out"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {message && (
        <p role="status" className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger-text">
          <PiWarningCircle aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
          <span className="flex-1">{message}</span>
          {item.issue === "INSUFFICIENT_STOCK" && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => changeQuantity(item.variant.stock)}
              className="btn btn-xs h-7 shrink-0 border-danger-text bg-base-100 text-danger-text"
            >
              Set to {item.variant.stock}
            </button>
          )}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 sm:pl-28">
        {isUnavailable ? (
          <span className="text-sm text-ink-muted">Qty {item.quantity}</span>
        ) : (
          <div className="join">
            <button
              type="button"
              aria-label={`Decrease quantity of ${item.product.name}`}
              disabled={isBusy || item.quantity <= 1}
              onClick={() => changeQuantity(item.quantity - 1)}
              className="btn join-item size-10"
            >
              <PiMinus aria-hidden="true" />
            </button>
            <span
              aria-live="polite"
              aria-label={`Quantity ${item.quantity}`}
              className="join-item flex w-11 items-center justify-center border-y border-base-300 font-semibold tabular-nums"
            >
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label={`Increase quantity of ${item.product.name}`}
              disabled={isBusy || item.quantity >= item.variant.stock}
              onClick={() => changeQuantity(item.quantity + 1)}
              className="btn join-item size-10"
            >
              <PiPlus aria-hidden="true" />
            </button>
          </div>
        )}

        <button
          type="button"
          disabled={isBusy}
          onClick={remove}
          aria-label={`Remove ${item.product.name} from cart`}
          className="btn btn-ghost btn-sm h-10 gap-1.5 text-danger-text hover:bg-danger-soft"
        >
          {isRemoving ? (
            <span aria-hidden="true" className="loading loading-spinner loading-xs" />
          ) : (
            <PiTrash aria-hidden="true" size={16} />
          )}
          Remove
        </button>
      </div>
    </li>
  );
}
