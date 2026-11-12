import Image from "next/image";
import Link from "next/link";
import { PiImageSquare, PiPencilSimple } from "react-icons/pi";
import { formatRupiah } from "@/lib/currency.lib";
import type { CheckoutPreview } from "@/types/order.type";

type Line = CheckoutPreview["items"][number];

function addonLabel(addon: Line["addons"][number]) {
  if (addon.type === "PACKAGING") return `Packaging box ${addon.size ?? ""} × ${addon.quantity}`;
  if (addon.type === "PAPER_BAG") return `Paper bag × ${addon.quantity}`;
  return addon.giftMessage ? `Gift card: “${addon.giftMessage}”` : "Gift card (blank)";
}

// daftar item yang akan dipesan (Figma: "Daftar Rangkaian Terpilih") + link kembali ke keranjang
export function CheckoutItems({ items }: { items: Line[] }) {
  return (
    <section aria-labelledby="checkout-items-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-4 p-5 sm:p-6">
        <header className="flex items-center justify-between gap-3">
          <h2 id="checkout-items-title" className="text-lg font-semibold text-ink">
            Your items
          </h2>
          <Link href="/cart" className="flex items-center gap-1 text-sm font-medium text-accent-text hover:underline">
            <PiPencilSimple aria-hidden="true" size={16} />
            Edit cart
          </Link>
        </header>

        <ul className="flex flex-col divide-y divide-base-300">
          {items.map((item, index) => (
            <li key={`${item.productName}-${index}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <PiImageSquare aria-hidden="true" size={20} className="absolute inset-0 m-auto text-ink-muted" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="line-clamp-2 text-sm font-semibold text-ink">{item.productName}</p>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">{formatRupiah(item.lineTotal)}</p>
                </div>
                <p className="text-xs text-ink-muted">
                  {item.variantLabel !== "Default" && <>Size {item.variantLabel} · </>}
                  Qty {item.quantity} · <span className="tabular-nums">{formatRupiah(item.unitPrice)}</span> each
                </p>
                {item.addons.length > 0 && (
                  <ul className="mt-1 flex flex-col gap-0.5 text-xs text-ink-muted">
                    {item.addons.map((addon) => (
                      <li key={addon.addonId} className="wrap-break-word">
                        + {addonLabel(addon)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
