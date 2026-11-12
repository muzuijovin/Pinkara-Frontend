"use client";

import { useState } from "react";
import { PiTrash, PiWarning } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { getErrorMessage } from "@/lib/error.lib";
import { useAdminProductDetail } from "../hooks/useAdminProductDetail";
import { useDeleteProduct } from "../hooks/useDeleteProduct";

type DeleteProductDialogProps = {
  product: { id: string; name: string };
  onClose: () => void;
  onDeleted?: () => void;
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

// konfirmasi hapus produk (PRD §12.1d): tampilkan dampaknya (keranjang & pesanan aktif),
// lalu admin wajib mengetik nama produk supaya tidak terhapus karena salah klik.
// Dirender hanya saat dibutuhkan; <dialog> bawaan dibuka lewat callback ref -> fokus terkunci & Esc menutup
export function DeleteProductDialog({ product, onClose, onDeleted }: DeleteProductDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const { data: detail, isPending: isLoadingImpact } = useAdminProductDetail(product.id);
  const { mutate, isPending, error } = useDeleteProduct();

  const isMatch = confirmation.trim() === product.name.trim();
  const impact = detail?.impact;
  const hasImpact = Boolean(impact && (impact.cartCount > 0 || impact.activeOrderCount > 0));

  const handleDelete = () => {
    if (!isMatch) return;
    mutate(product.id, {
      onSuccess: () => {
        toast.success(`"${product.name}" was deleted.`);
        onDeleted?.();
        onClose();
      },
    });
  };

  return (
    <dialog
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      onClose={onClose}
      aria-labelledby="delete-product-title"
      aria-describedby="delete-product-desc"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="modal-box">
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger-text">
            <PiTrash aria-hidden="true" size={20} />
          </span>
          <div className="min-w-0">
            <h3 id="delete-product-title" className="text-lg font-semibold text-ink">
              Delete this product?
            </h3>
            <p id="delete-product-desc" className="mt-1 text-sm text-ink-muted">
              <span className="font-medium text-ink wrap-break-word">{product.name}</span> will be removed from the
              catalog and can no longer be bought. Past orders keep their details.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {isLoadingImpact && <div className="skeleton h-12 w-full" />}
          {hasImpact && impact && (
            <div role="status" className="flex gap-2.5 rounded-box bg-warning/15 p-3 text-sm text-ink">
              <PiWarning aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-warning" />
              <p>
                This product is in{" "}
                <strong>{plural(impact.cartCount, "cart")}</strong> and{" "}
                <strong>{plural(impact.activeOrderCount, "active order")}</strong>. Existing orders stay as they
                are, but buyers won&apos;t be able to check it out from their cart.
              </p>
            </div>
          )}

          {error && <FormAlert message={getErrorMessage(error, "Couldn't delete the product. Please try again.")} />}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleDelete();
            }}
            className="flex flex-col gap-1.5"
          >
            <label htmlFor="delete-product-confirm" className="text-sm text-ink">
              Type <span className="font-semibold wrap-break-word">{product.name}</span> to confirm
            </label>
            <input
              id="delete-product-confirm"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="input h-11 w-full text-base sm:text-sm"
            />
          </form>
        </div>

        <div className="modal-action">
          <form method="dialog">
            <button disabled={isPending} className="btn btn-ghost h-11 text-ink">
              Cancel
            </button>
          </form>
          <button
            type="button"
            disabled={!isMatch || isPending}
            onClick={handleDelete}
            className="btn btn-error h-11"
          >
            {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
            {isPending ? "Deleting..." : "Delete product"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close" disabled={isPending}>
          close
        </button>
      </form>
    </dialog>
  );
}
