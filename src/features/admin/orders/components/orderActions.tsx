"use client";

import { useState, type ReactNode } from "react";
import { PiProhibit, PiTruck } from "react-icons/pi";
import { toast } from "react-toastify";
import { TextareaField } from "@/components/form/textareaField";
import { formatRupiah } from "@/lib/currency.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { AdminOrderDetail } from "@/types/order.type";
import { useCancelOrder, useRefundOrder, useUpdateOrderStatus, type UpdateStatusVariables } from "../hooks/useAdminOrders";

const COURIERS = ["JNE", "J&T", "SiCepat", "AnterAja", "GoSend", "GrabExpress", "Own courier"];

function actionLabel(status: UpdateStatusVariables["status"], order: AdminOrderDetail) {
  switch (status) {
    case "DIKEMAS":
      return "Start packing";
    case "DIPRODUKSI":
      return "Start production";
    case "SIAP_KIRIM":
      return "Mark as ready to ship";
    case "DIKIRIM":
      return "Mark as shipped";
    case "SELESAI":
      return order.shippingMethod === "PICKUP" && order.status !== "DIKIRIM" ? "Mark as picked up" : "Mark as completed";
  }
}

// popup <dialog> bawaan (fokus terkunci, Esc menutup), dibuka lewat callback ref saat dirender
function ActionDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <dialog
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      onClose={onClose}
      aria-labelledby="order-action-title"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="modal-box">
        <h3 id="order-action-title" className="text-lg font-semibold text-ink">
          {title}
        </h3>
        {children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close">close</button>
      </form>
    </dialog>
  );
}

function CancelDialog({ order, onClose }: { order: AdminOrderDetail; onClose: () => void }) {
  const { mutate: cancel, isPending } = useCancelOrder(order.code);
  const [reason, setReason] = useState("");
  const isPaid = order.status !== "MENUNGGU_PEMBAYARAN";

  return (
    <ActionDialog title="Cancel this order?" onClose={onClose}>
      <p className="mt-2 text-sm text-ink-muted">
        Items go back to stock and the promo spot (if any) is released.
        {isPaid && " The customer has already paid, so the order will move to Refund in progress."}
      </p>
      <div className="mt-4">
        <TextareaField
          id="cancel-reason"
          label="Reason (shown to the customer)"
          rows={3}
          maxLength={255}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. The flowers for this bouquet are out of season."
        />
      </div>
      <div className="modal-action">
        <form method="dialog">
          <button disabled={isPending} className="btn btn-ghost h-11 text-ink">
            Keep order
          </button>
        </form>
        <button
          type="button"
          disabled={reason.trim().length < 3 || isPending}
          onClick={() =>
            cancel(reason.trim(), {
              onSuccess: () => {
                toast.success(`Order ${order.code} was cancelled.`);
                onClose();
              },
              onError: (error) => toast.error(getErrorMessage(error)),
            })
          }
          className="btn btn-error h-11"
        >
          {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
          {isPending ? "Cancelling..." : "Cancel order"}
        </button>
      </div>
    </ActionDialog>
  );
}

function RefundDialog({ order, onClose }: { order: AdminOrderDetail; onClose: () => void }) {
  const { mutate: refund, isPending } = useRefundOrder(order.code);
  const [amount, setAmount] = useState(String(order.total));
  const [reason, setReason] = useState("");
  const amountNumber = Number(amount);
  const amountError = !/^\d+$/.test(amount) || amountNumber < 1 ? "Enter a whole number" : amountNumber > order.total ? "Can't be more than the order total" : undefined;

  return (
    <ActionDialog title="Mark as refunded" onClose={onClose}>
      <p className="mt-2 text-sm text-ink-muted">
        Record the refund after you&apos;ve sent the money back to the customer. Order total: {formatRupiah(order.total)}.
      </p>
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="refund-amount" className="text-sm font-medium text-ink">
            Refund amount (Rp)
          </label>
          <input
            id="refund-amount"
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={amountError ? true : undefined}
            className={`input h-11 w-full text-base tabular-nums sm:text-sm ${amountError ? "input-error" : ""}`}
          />
          {amountError && <p className="text-xs text-danger-text">{amountError}</p>}
        </div>
        <TextareaField
          id="refund-reason"
          label="Note"
          rows={2}
          maxLength={255}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. Full refund via BCA transfer on 12 Nov"
        />
      </div>
      <div className="modal-action">
        <form method="dialog">
          <button disabled={isPending} className="btn btn-ghost h-11 text-ink">
            Cancel
          </button>
        </form>
        <button
          type="button"
          disabled={Boolean(amountError) || reason.trim().length < 3 || isPending}
          onClick={() =>
            refund(
              { amount: amountNumber, reason: reason.trim() },
              {
                onSuccess: () => {
                  toast.success("Refund recorded.");
                  onClose();
                },
                onError: (error) => toast.error(getErrorMessage(error)),
              },
            )
          }
          className="btn btn-primary h-11"
        >
          {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
          Save refund
        </button>
      </div>
    </ActionDialog>
  );
}

// aksi penjual sesuai state machine (tombol hanya untuk transisi yang diizinkan BE)
export function OrderActions({ order }: { order: AdminOrderDetail }) {
  const { mutate: updateStatus, isPending, variables } = useUpdateOrderStatus(order.code);
  const [courier, setCourier] = useState(order.courier ?? COURIERS[0]);
  const [trackingNo, setTrackingNo] = useState("");
  const [dialog, setDialog] = useState<"cancel" | "refund" | null>(null);

  const next = order.allowedNextStatuses as UpdateStatusVariables["status"][];
  const hasActions = next.length > 0 || order.canCancel || order.canRefund;
  if (!hasActions) return null;

  const run = (body: UpdateStatusVariables) =>
    updateStatus(body, {
      onSuccess: () => toast.success("Order updated."),
      onError: (error) => toast.error(getErrorMessage(error)),
    });

  return (
    <section aria-labelledby="actions-title" className="card border border-primary/40 bg-base-100">
      <div className="card-body gap-4 p-5 sm:p-6">
        <h2 id="actions-title" className="text-lg font-semibold text-ink">
          Next step
        </h2>

        {next.map((status) =>
          status === "DIKIRIM" ? (
            // dikirim wajib kurir + nomor resi (PRD §12)
            <form
              key={status}
              onSubmit={(event) => {
                event.preventDefault();
                run({ status, courier, trackingNo: trackingNo.trim() });
              }}
              className="flex flex-col gap-3"
            >
              <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="courier" className="text-sm font-medium text-ink">
                    Courier
                  </label>
                  <select
                    id="courier"
                    value={courier}
                    onChange={(event) => setCourier(event.target.value)}
                    className="select h-11 w-full text-base sm:text-sm"
                  >
                    {COURIERS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tracking" className="text-sm font-medium text-ink">
                    Tracking number
                  </label>
                  <input
                    id="tracking"
                    value={trackingNo}
                    onChange={(event) => setTrackingNo(event.target.value)}
                    placeholder="e.g. JP1234567890"
                    className="input h-11 w-full font-mono text-base sm:text-sm"
                  />
                </div>
              </div>
              <button type="submit" disabled={isPending || trackingNo.trim().length < 3} className="btn btn-primary h-11 gap-2">
                {isPending && variables?.status === status ? (
                  <span aria-hidden="true" className="loading loading-spinner loading-sm" />
                ) : (
                  <PiTruck aria-hidden="true" size={18} />
                )}
                {actionLabel(status, order)}
              </button>
            </form>
          ) : (
            <button key={status} type="button" disabled={isPending} onClick={() => run({ status })} className="btn btn-primary h-11">
              {isPending && variables?.status === status && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
              {actionLabel(status, order)}
            </button>
          ),
        )}

        {order.canRefund && (
          <button type="button" onClick={() => setDialog("refund")} className="btn btn-primary h-11">
            Mark as refunded
          </button>
        )}

        {order.canCancel && (
          <button
            type="button"
            onClick={() => setDialog("cancel")}
            className="btn btn-ghost h-10 gap-1.5 text-danger-text hover:bg-danger-soft"
          >
            <PiProhibit aria-hidden="true" size={16} />
            Cancel order
          </button>
        )}
      </div>

      {dialog === "cancel" && <CancelDialog order={order} onClose={() => setDialog(null)} />}
      {dialog === "refund" && <RefundDialog order={order} onClose={() => setDialog(null)} />}
    </section>
  );
}
