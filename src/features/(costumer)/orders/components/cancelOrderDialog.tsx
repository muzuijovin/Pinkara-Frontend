"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PiProhibit } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { TextareaField } from "@/components/form/textareaField";
import { cancelOrderSchema, type CancelOrderInput } from "@/features/validation/refundSchema";
import { formatRupiah } from "@/lib/currency.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { OrderDetail } from "@/types/order.type";
import { useCancelMyOrder } from "../hooks/useOrder";

// pembeli membatalkan pesanan yang sudah dibayar (sebelum diproduksi / dikirim): uang kembali sebagian.
// Dialog menjelaskan nominal refund sebelum pembeli mengonfirmasi
function CancelOrderDialog({ order, onClose }: { order: OrderDetail; onClose: () => void }) {
  const { mutate: cancel, isPending, error } = useCancelMyOrder(order.code);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CancelOrderInput>({ resolver: zodResolver(cancelOrderSchema), defaultValues: { reason: "" } });

  const submit = handleSubmit(({ reason }) =>
    cancel(reason, {
      onSuccess: () => {
        toast.success("Your order has been cancelled.");
        onClose();
      },
    }),
  );

  return (
    <dialog
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      onClose={onClose}
      aria-labelledby="cancel-order-title"
      className="modal modal-bottom sm:modal-middle"
    >
      <form noValidate onSubmit={submit} className="modal-box flex flex-col gap-4">
        <h3 id="cancel-order-title" className="text-lg font-semibold text-ink">
          Cancel this order?
        </h3>
        <div className="rounded-box bg-warning/15 p-4 text-sm text-ink">
          <p>
            You&apos;ll get back <strong>{order.cancelRefundPercent}%</strong> of your payment:{" "}
            <strong className="tabular-nums">{formatRupiah(order.cancelRefundAmount)}</strong> of {formatRupiah(order.total)}.
          </p>
          <p className="mt-1 text-ink-muted">We prepare your flowers right after payment, so the rest covers what we&apos;ve already used.</p>
        </div>
        {error && <FormAlert message={getErrorMessage(error)} />}
        <TextareaField
          id="cancel-reason"
          label="Why are you cancelling?"
          rows={3}
          maxLength={255}
          required
          placeholder="e.g. My plans changed"
          error={errors.reason?.message}
          {...register("reason")}
        />
        <div className="modal-action mt-0 flex-col-reverse gap-2 sm:flex-row">
          <button type="button" onClick={onClose} disabled={isPending} className="btn btn-ghost h-11 text-ink">
            Keep my order
          </button>
          <button type="submit" disabled={isPending} className="btn btn-error h-11">
            {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
            Cancel order
          </button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close">close</button>
      </form>
    </dialog>
  );
}

// tombol "Cancel order" di detail pesanan (hanya saat canCancel)
export function CancelOrderButton({ order }: { order: OrderDetail }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 border-t border-base-300 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-muted">
          Changed your mind? You can cancel before we start production or shipping and get {order.cancelRefundPercent}% back.
        </p>
        <button type="button" onClick={() => setOpen(true)} className="btn btn-outline btn-sm h-10 shrink-0 gap-1.5 border-base-300 text-danger-text">
          <PiProhibit aria-hidden="true" size={16} />
          Cancel order
        </button>
      </div>
      {open && <CancelOrderDialog order={order} onClose={() => setOpen(false)} />}
    </>
  );
}
