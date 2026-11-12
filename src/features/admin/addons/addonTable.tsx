"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PiGift, PiPackage, PiPencilSimple, PiPlus, PiShoppingBag, PiStack, PiTrash, PiWarning } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { formatRupiah } from "@/lib/currency.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { AdminAddon } from "@/types/catalog.type";
import type { AddonType } from "@/types/product.type";
import { StockAdjustDialog } from "./components/stockAdjustDialog";
import { useAdminAddons, useDeleteAddon } from "./hooks/useAdminAddons";

export const ADDON_TYPE_INFO: Record<AddonType, { label: string; icon: typeof PiPackage; hint: string }> = {
  PACKAGING: { label: "Packaging boxes", icon: PiPackage, hint: "One box per item, matched to the product size" },
  PAPER_BAG: { label: "Paper bags", icon: PiShoppingBag, hint: "Up to item quantity + 2 per line" },
  GIFT_CARD: { label: "Gift cards", icon: PiGift, hint: "One printed card per line" },
};
const TYPE_ORDER: AddonType[] = ["PACKAGING", "PAPER_BAG", "GIFT_CARD"];

function DeleteDialog({ addon, onClose }: { addon: AdminAddon; onClose: () => void }) {
  const { mutate, isPending } = useDeleteAddon();
  return (
    <dialog
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      onClose={onClose}
      aria-labelledby="delete-addon-title"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="modal-box">
        <h3 id="delete-addon-title" className="text-lg font-semibold text-ink">
          Delete {addon.name}?
        </h3>
        <p className="mt-2 text-sm text-ink-muted">
          Buyers won&apos;t be able to choose it anymore. Past orders keep their details. Carts that still have it will ask
          buyers to remove it before checkout.
        </p>
        <div className="modal-action">
          <button type="button" onClick={onClose} disabled={isPending} className="btn btn-ghost h-11 text-ink">
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              mutate(addon.id, {
                onSuccess: () => {
                  toast.success(`${addon.name} was deleted.`);
                  onClose();
                },
                onError: (error) => toast.error(getErrorMessage(error)),
              })
            }
            className="btn btn-error h-11"
          >
            {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
            Delete
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close">close</button>
      </form>
    </dialog>
  );
}

// daftar add-on (PRD §4.4, §12): dikelompokkan per tipe, penanda stok menipis, ubah stok, edit, hapus
export function AddonTable() {
  const { data: addons, isPending, isError, error, refetch } = useAdminAddons();
  const [stockTarget, setStockTarget] = useState<AdminAddon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAddon | null>(null);
  const lowStock = addons?.filter((addon) => addon.isActive && addon.isLowStock) ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink md:text-3xl">Add-ons</h1>
          <p className="mt-1 text-sm text-ink-muted">Boxes, paper bags, and gift cards buyers can attach to their flowers.</p>
        </div>
        <Link href="/admin/addons/create" className="btn btn-primary h-11 gap-2">
          <PiPlus aria-hidden="true" size={18} />
          Add add-on
        </Link>
      </div>

      {lowStock.length > 0 && (
        <p role="status" className="mt-5 flex items-start gap-2 rounded-box bg-warning/15 px-4 py-3 text-sm text-ink">
          <PiWarning aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-warning" />
          Running low: {lowStock.map((addon) => `${addon.name} (${addon.stock})`).join(", ")}
        </p>
      )}

      {isPending && <div className="skeleton mt-6 h-72 w-full" />}
      {isError && (
        <div className="mt-6 flex flex-col gap-3">
          <FormAlert message={getErrorMessage(error, "Couldn't load add-ons.")} />
          <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
            Try again
          </button>
        </div>
      )}

      {addons && (
        <div className="mt-6 flex flex-col gap-6">
          {TYPE_ORDER.map((type) => {
            const rows = addons.filter((addon) => addon.type === type);
            const { label, icon: Icon, hint } = ADDON_TYPE_INFO[type];
            return (
              <section key={type} aria-labelledby={`type-${type}`} className="card border border-base-300 bg-base-100">
                <header className="flex items-center gap-3 border-b border-base-300 px-5 py-4">
                  <Icon aria-hidden="true" size={22} className="text-primary" />
                  <div>
                    <h2 id={`type-${type}`} className="font-semibold text-ink">
                      {label}
                    </h2>
                    <p className="text-xs text-ink-muted">{hint}</p>
                  </div>
                </header>
                {rows.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-ink-muted">None yet.</p>
                ) : (
                  <ul className="divide-y divide-base-300">
                    {rows.map((addon) => (
                      <li key={addon.id} className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center ${addon.isActive ? "" : "opacity-60"}`}>
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                            {addon.imageUrl ? <Image src={addon.imageUrl} alt="" fill sizes="48px" className="object-cover" /> : <Icon aria-hidden="true" size={20} className="text-ink-muted" />}
                          </span>
                          <div className="min-w-0">
                            <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
                              {addon.name}
                              {addon.size && <span className="badge badge-sm border-none bg-surface-sunken">Size {addon.size}</span>}
                              {!addon.isActive && <span className="badge badge-sm border-none bg-surface-sunken text-ink-muted">Inactive</span>}
                            </p>
                            <p className="text-sm tabular-nums text-ink-muted">{formatRupiah(addon.price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <span className={`text-sm tabular-nums ${addon.stock === 0 ? "font-semibold text-danger-text" : addon.isLowStock ? "font-semibold text-warning" : "text-ink"}`}>
                            {addon.stock === 0 ? "Out of stock" : `${addon.stock} in stock`}
                            {addon.isLowStock && addon.stock > 0 && " · low"}
                          </span>
                          <div className="flex gap-1">
                            <button type="button" onClick={() => setStockTarget(addon)} className="btn btn-ghost btn-sm h-9 gap-1.5 text-ink">
                              <PiStack aria-hidden="true" size={16} />
                              Stock
                            </button>
                            <Link href={`/admin/addons/${addon.id}/edit`} aria-label={`Edit ${addon.name}`} className="btn btn-ghost btn-sm h-9 gap-1.5 text-ink">
                              <PiPencilSimple aria-hidden="true" size={16} />
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(addon)}
                              aria-label={`Delete ${addon.name}`}
                              className="btn btn-ghost btn-square btn-sm size-9 text-danger-text hover:bg-danger-soft"
                            >
                              <PiTrash aria-hidden="true" size={16} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {stockTarget && <StockAdjustDialog addon={stockTarget} onClose={() => setStockTarget(null)} />}
      {deleteTarget && <DeleteDialog addon={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}
