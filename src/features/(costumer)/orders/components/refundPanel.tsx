"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PiArrowCounterClockwise, PiBank, PiCheckCircle, PiPencilSimple } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { TextField } from "@/components/form/textField";
import { refundAccountSchema, type RefundAccountInput } from "@/features/validation/refundSchema";
import { formatRupiah } from "@/lib/currency.lib";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { OrderDetail } from "@/types/order.type";
import { useSaveRefundAccount } from "../hooks/useOrder";

// saran nama bank (tetap bisa diketik bebas)
const BANK_SUGGESTIONS = ["BCA", "BNI", "BRI", "Mandiri", "Permata", "CIMB Niaga", "BSI", "Danamon", "BTN", "Jago", "SeaBank", "blu by BCA Digital"];

// form rekening tujuan refund (isi pertama kali atau ubah)
function RefundAccountForm({ order, onDone, onCancel }: { order: OrderDetail; onDone: () => void; onCancel?: () => void }) {
  const { mutate: save, isPending, error } = useSaveRefundAccount(order.code);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RefundAccountInput>({
    resolver: zodResolver(refundAccountSchema),
    defaultValues: {
      bankName: order.refundBankName ?? "",
      accountNumber: order.refundAccountNumber ?? "",
      accountName: order.refundAccountName ?? order.shipRecipientName ?? "",
    },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        save(values, {
          onSuccess: () => {
            toast.success("Bank details saved.");
            onDone();
          },
        }),
      )}
      className="flex flex-col gap-4"
    >
      {error && <FormAlert message={getErrorMessage(error)} />}
      <TextField id="refund-bank" label="Bank" list="refund-bank-list" autoComplete="off" required error={errors.bankName?.message} {...register("bankName")} />
      <datalist id="refund-bank-list">
        {BANK_SUGGESTIONS.map((bank) => (
          <option key={bank} value={bank} />
        ))}
      </datalist>
      <TextField
        id="refund-account-number"
        label="Account number"
        inputMode="numeric"
        autoComplete="off"
        required
        error={errors.accountNumber?.message}
        {...register("accountNumber")}
      />
      <TextField
        id="refund-account-name"
        label="Account holder name"
        autoComplete="name"
        required
        hint="As written on the bank account"
        error={errors.accountName?.message}
        {...register("accountName")}
      />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isPending} className="btn btn-ghost h-11 text-ink">
            Cancel
          </button>
        )}
        <button type="submit" disabled={isPending} className="btn btn-primary h-11">
          {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
          Save bank details
        </button>
      </div>
    </form>
  );
}

// panel refund di detail pesanan: menunggu refund (nominal + rekening tujuan) atau sudah direfund (nominal + bukti)
export function RefundPanel({ order }: { order: OrderDetail }) {
  const hasAccount = Boolean(order.refundAccountNumber);
  const [editing, setEditing] = useState(false);
  const pending = order.status === "PERLU_REFUND";

  return (
    <section aria-labelledby="refund-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-4 p-5 sm:p-6">
        <h2 id="refund-title" className="flex items-center gap-2 text-lg font-semibold text-ink">
          <PiArrowCounterClockwise aria-hidden="true" size={20} className="text-primary" />
          Refund
        </h2>

        {pending ? (
          <>
            <dl className="flex flex-col gap-1.5 rounded-box bg-surface-muted p-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">You paid</dt>
                <dd className="tabular-nums text-ink">{formatRupiah(order.total)}</dd>
              </div>
              <div className="flex justify-between gap-3 font-semibold">
                <dt className="text-ink">We&apos;ll refund</dt>
                <dd className="tabular-nums text-ink">{formatRupiah(order.refundExpected ?? order.total)}</dd>
              </div>
              {order.cancelledBy === "CUSTOMER" && (
                <p className="text-xs text-ink-muted">{order.cancelRefundPercent}% of your payment, because the order was cancelled by you.</p>
              )}
            </dl>

            {hasAccount && !editing ? (
              <div className="flex flex-col gap-3 rounded-box border border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 text-sm">
                  <PiBank aria-hidden="true" size={22} className="mt-0.5 shrink-0 text-ink-muted" />
                  <p className="text-ink">
                    <span className="block text-xs text-ink-muted">Refund to</span>
                    {order.refundBankName} · <span className="font-mono">{order.refundAccountNumber}</span>
                    <span className="block">{order.refundAccountName}</span>
                  </p>
                </div>
                <button type="button" onClick={() => setEditing(true)} className="btn btn-ghost btn-sm h-10 gap-1.5 self-start text-accent-text sm:self-center">
                  <PiPencilSimple aria-hidden="true" size={16} />
                  Edit
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {!hasAccount && (
                  <p className="text-sm text-ink">Where should we send your refund? Add the bank account that will receive it.</p>
                )}
                <RefundAccountForm order={order} onDone={() => setEditing(false)} onCancel={hasAccount ? () => setEditing(false) : undefined} />
              </div>
            )}
            <p className="text-xs text-ink-muted">Our team will transfer the refund and upload the receipt here. You&apos;ll get a notification when it&apos;s sent.</p>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="flex items-start gap-2 text-sm text-ink">
              <PiCheckCircle aria-hidden="true" size={20} className="mt-px shrink-0 text-success-text" />
              <span>
                We refunded <strong className="tabular-nums">{formatRupiah(order.refundAmount ?? 0)}</strong>
                {order.refundedAt && <> on {formatDateTimeWIB(order.refundedAt)}</>}
                {order.refundAccountNumber && (
                  <>
                    {" "}
                    to {order.refundBankName} {order.refundAccountNumber}
                  </>
                )}
                .
              </span>
            </p>
            {order.refundProofUrl && (
              <a
                href={order.refundProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-fit flex-col gap-2 text-sm font-medium text-accent-text"
              >
                <span className="relative block h-40 w-32 overflow-hidden rounded-box border border-base-300 bg-surface-muted">
                  <Image src={order.refundProofUrl} alt="Refund transfer receipt" fill sizes="128px" className="object-cover" />
                </span>
                <span className="underline-offset-2 group-hover:underline">
                  View transfer receipt
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
