"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { PiMinus, PiPlus } from "react-icons/pi";
import { toast } from "react-toastify";
import { stockAdjustSchema, type StockAdjustInput } from "@/features/validation/catalogSchema";
import { getErrorMessage } from "@/lib/error.lib";
import type { AdminAddon } from "@/types/catalog.type";
import { useAdjustAddonStock } from "../hooks/useAdminAddons";

const REASONS: { value: StockAdjustInput["reason"]; label: string }[] = [
  { value: "RESTOCK", label: "Restock (new stock arrived)" },
  { value: "DAMAGED", label: "Damaged / unusable" },
  { value: "CORRECTION", label: "Stock count correction" },
];

// penyesuaian stok +/- dengan alasan (PRD §12.1c), bukan menimpa angka stok.
// Aman bersamaan dengan checkout: BE menambah / mengurangi secara atomik dan menolak stok minus
export function StockAdjustDialog({ addon, onClose }: { addon: AdminAddon; onClose: () => void }) {
  const { mutate, isPending } = useAdjustAddonStock();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<StockAdjustInput>({
    resolver: zodResolver(stockAdjustSchema),
    defaultValues: { direction: "add", amount: "", reason: "RESTOCK", note: "" },
  });
  const direction = useWatch({ control, name: "direction" });
  const amount = Number(useWatch({ control, name: "amount" })) || 0;
  const nextStock = addon.stock + (direction === "add" ? amount : -amount);

  const onSubmit = (values: StockAdjustInput) =>
    mutate(
      { id: addon.id, delta: (values.direction === "add" ? 1 : -1) * Number(values.amount), reason: values.reason, note: values.note },
      {
        onSuccess: () => {
          toast.success(`Stock for ${addon.name} updated.`);
          onClose();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );

  return (
    <dialog
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      onClose={onClose}
      aria-labelledby="stock-title"
      className="modal modal-bottom sm:modal-middle"
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="modal-box flex flex-col gap-4">
        <div>
          <h3 id="stock-title" className="text-lg font-semibold text-ink">
            Adjust stock
          </h3>
          <p className="text-sm text-ink-muted">
            {addon.name} · current stock <span className="font-semibold tabular-nums text-ink">{addon.stock}</span>
          </p>
        </div>

        <div role="radiogroup" aria-label="Add or remove stock" className="grid grid-cols-2 gap-2">
          {(["add", "remove"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={direction === value}
              onClick={() => {
                setValue("direction", value);
                setValue("reason", value === "add" ? "RESTOCK" : "DAMAGED");
              }}
              className={`btn h-11 gap-1.5 ${direction === value ? "btn-primary" : "btn-outline border-base-300 text-ink"}`}
            >
              {value === "add" ? <PiPlus aria-hidden="true" size={16} /> : <PiMinus aria-hidden="true" size={16} />}
              {value === "add" ? "Add stock" : "Remove stock"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="stock-amount" className="text-sm font-medium text-ink">
            Amount
          </label>
          <input id="stock-amount" inputMode="numeric" autoFocus className={`input h-11 w-full text-base tabular-nums sm:text-sm ${errors.amount ? "input-error" : ""}`} {...register("amount")} />
          {errors.amount ? (
            <p className="text-xs text-danger-text">{errors.amount.message}</p>
          ) : (
            amount > 0 && (
              <p className={`text-xs ${nextStock < 0 ? "text-danger-text" : "text-ink-muted"}`}>
                {nextStock < 0 ? "Stock can't go below 0" : `New stock: ${nextStock}`}
              </p>
            )
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="stock-reason" className="text-sm font-medium text-ink">
            Reason
          </label>
          <select id="stock-reason" className="select h-11 w-full text-base sm:text-sm" {...register("reason")}>
            {REASONS.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="stock-note" className="text-sm font-medium text-ink">
            Note (optional)
          </label>
          <input id="stock-note" maxLength={200} placeholder="e.g. Supplier delivery #12" className="input h-11 w-full text-base sm:text-sm" {...register("note")} />
        </div>

        <div className="modal-action mt-0">
          <button type="button" onClick={onClose} disabled={isPending} className="btn btn-ghost h-11 text-ink">
            Cancel
          </button>
          <button type="submit" disabled={isPending || nextStock < 0} className="btn btn-primary h-11">
            {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
            Save
          </button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close">close</button>
      </form>
    </dialog>
  );
}
