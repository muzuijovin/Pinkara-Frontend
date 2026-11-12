"use client";

import Image from "next/image";
import { PiCopySimple, PiImageSquare } from "react-icons/pi";
import { toast } from "react-toastify";
import { formatRupiah } from "@/lib/currency.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { AdminOrderDetail } from "@/types/order.type";
import { usePackAddon } from "../hooks/useAdminOrders";

type Addon = AdminOrderDetail["items"][number]["addons"][number];

function addonTitle(addon: Addon) {
  if (addon.type === "PACKAGING") return `Packaging box ${addon.size ?? ""}`;
  if (addon.type === "PAPER_BAG") return "Paper bag";
  return "Gift card";
}

// lembar kerja pengemasan (PRD §12): tiap produk + add-on-nya, teks gift card siap cetak,
// centang "sudah dikemas" per add-on
export function PackingWorksheet({ order }: { order: AdminOrderDetail }) {
  const { mutate: pack, isPending, variables } = usePackAddon(order.code);

  const toggle = (addon: Addon) =>
    pack({ addonId: addon.id, packed: !addon.packedAt }, { onError: (error) => toast.error(getErrorMessage(error)) });

  const copyMessage = (addon: Addon) => {
    const signature = addon.hideSender ? "" : addon.senderName ? `\n\n— ${addon.senderName}` : "";
    navigator.clipboard
      .writeText(`${addon.giftMessage ?? ""}${signature}`)
      .then(() => toast.success("Card text copied"))
      .catch(() => toast.error("Couldn't copy. Please copy it manually."));
  };

  return (
    <section aria-labelledby="packing-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-4 p-5 sm:p-6">
        <header>
          <h2 id="packing-title" className="text-lg font-semibold text-ink">
            Packing list
          </h2>
          {!order.canPack && <p className="text-sm text-ink-muted">Packing can be checked off while the order is being prepared.</p>}
        </header>

        <ul className="flex flex-col divide-y divide-base-300">
          {order.items.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
              <div className="flex gap-3">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <PiImageSquare aria-hidden="true" size={20} className="absolute inset-0 m-auto text-ink-muted" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold text-ink">
                      {item.quantity}× {item.productName}
                    </p>
                    <p className="shrink-0 text-sm tabular-nums text-ink">{formatRupiah(item.lineTotal)}</p>
                  </div>
                  {item.variantLabel && item.variantLabel !== "Default" && (
                    <p className="text-sm text-ink-muted">Size {item.variantLabel}</p>
                  )}
                </div>
              </div>

              {item.addons.length > 0 && (
                <ul className="flex flex-col gap-2 sm:pl-[76px]">
                  {item.addons.map((addon) => {
                    const isSaving = isPending && variables?.addonId === addon.id;
                    return (
                      <li key={addon.id} className="rounded-box border border-base-300 p-3">
                        <label className={`flex items-start gap-3 ${order.canPack ? "cursor-pointer" : "cursor-default"}`}>
                          {isSaving ? (
                            <span aria-hidden="true" className="loading loading-spinner loading-sm mt-0.5 text-primary" />
                          ) : (
                            <input
                              type="checkbox"
                              checked={Boolean(addon.packedAt)}
                              disabled={!order.canPack || isPending}
                              onChange={() => toggle(addon)}
                              className="checkbox checkbox-primary checkbox-sm mt-0.5"
                            />
                          )}
                          <span className={`flex-1 text-sm ${addon.packedAt ? "text-ink-muted" : "text-ink"}`}>
                            <span className="font-medium">{addonTitle(addon)}</span> × {addon.quantity}
                            {addon.packedAt && <span className="ml-2 text-xs text-success-text">Packed</span>}
                          </span>
                        </label>

                        {addon.type === "GIFT_CARD" && (
                          <div className="mt-3 rounded-lg bg-surface-muted p-3">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm whitespace-pre-line text-ink wrap-break-word">
                                {addon.giftMessage || <span className="italic text-ink-muted">Blank card (no message)</span>}
                              </p>
                              {addon.giftMessage && (
                                <button
                                  type="button"
                                  onClick={() => copyMessage(addon)}
                                  aria-label="Copy card text"
                                  className="btn btn-ghost btn-square btn-sm size-8 shrink-0 text-ink-muted"
                                >
                                  <PiCopySimple aria-hidden="true" size={16} />
                                </button>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-ink-muted">
                              {addon.hideSender ? "Don't show the sender's name" : addon.senderName ? `From: ${addon.senderName}` : "No sender name"}
                            </p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
