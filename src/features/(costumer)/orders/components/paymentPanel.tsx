"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { PiBank, PiCopySimple, PiFlask, PiQrCode, PiWarningCircle } from "react-icons/pi";
import { toast } from "react-toastify";
import { OptionCard } from "@/features/(costumer)/checkout/components/optionCard";
import { getErrorMessage } from "@/lib/error.lib";
import type { OrderDetail, VaBank } from "@/types/order.type";
import { useCreatePayment, useSimulatePayment } from "../hooks/useOrder";

const BANKS: { value: VaBank; label: string }[] = [
  { value: "bca", label: "BCA" },
  { value: "bni", label: "BNI" },
  { value: "bri", label: "BRI" },
  { value: "permata", label: "Permata" },
];

const bankLabel = (bank: VaBank | null) => BANKS.find((item) => item.value === bank)?.label ?? "Bank";

function copyText(text: string, label: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} copied`))
    .catch(() => toast.error("Couldn't copy. Please copy it manually."));
}

type Method = "QRIS" | "VIRTUAL_ACCOUNT";

// pilih metode (QRIS / VA + bank) lalu buat tagihan. Dipakai juga untuk "ganti metode bayar" (PRD §14)
function MethodChooser({ order, onDone }: { order: OrderDetail; onDone?: () => void }) {
  const { mutate: createPayment, isPending } = useCreatePayment(order.code);
  const [method, setMethod] = useState<Method>(order.paymentMethod === "VIRTUAL_ACCOUNT" ? "VIRTUAL_ACCOUNT" : "QRIS");
  const [bank, setBank] = useState<VaBank>(order.payment?.vaBank ?? "bca");

  const submit = () =>
    createPayment(
      { method, bank: method === "VIRTUAL_ACCOUNT" ? bank : undefined },
      {
        onSuccess: () => onDone?.(),
        onError: (error) => toast.error(getErrorMessage(error, "Couldn't create the payment. Please try again.")),
      },
    );

  return (
    <div className="flex w-full flex-col gap-4 text-left">
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold text-ink">How would you like to pay?</legend>
        <OptionCard
          name="pay-method"
          value="QRIS"
          checked={method === "QRIS"}
          onChange={() => setMethod("QRIS")}
          icon={<PiQrCode size={20} />}
          title="QRIS"
          description="Scan with any e-wallet or mobile banking app."
        />
        <OptionCard
          name="pay-method"
          value="VIRTUAL_ACCOUNT"
          checked={method === "VIRTUAL_ACCOUNT"}
          onChange={() => setMethod("VIRTUAL_ACCOUNT")}
          icon={<PiBank size={20} />}
          title="Virtual Account"
          description="Transfer from your bank app. Confirmed automatically."
        />
      </fieldset>

      {method === "VIRTUAL_ACCOUNT" && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold text-ink">Choose your bank</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BANKS.map((item) => (
              <label
                key={item.value}
                className={`flex h-11 cursor-pointer items-center justify-center rounded-box border text-sm font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${
                  bank === item.value ? "border-primary bg-accent-soft/30 text-accent-text" : "border-base-300 text-ink hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="va-bank"
                  value={item.value}
                  checked={bank === item.value}
                  onChange={() => setBank(item.value)}
                  className="sr-only"
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <button type="button" disabled={isPending} onClick={submit} className="btn btn-primary h-12 w-full text-[15px]">
        {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
        {isPending ? "Preparing payment..." : method === "QRIS" ? "Show QR code" : "Get account number"}
      </button>
    </div>
  );
}

// tagihan aktif: QR (QRIS) atau nomor VA + cara bayar. Status dicek otomatis tiap 5 detik (useOrder)
export function PaymentPanel({ order }: { order: OrderDetail }) {
  const [isChanging, setIsChanging] = useState(false);
  const { mutate: simulate, isPending: isSimulating } = useSimulatePayment(order.code);
  const payment = order.payment;

  if (!payment || payment.status === "EXPIRED" || isChanging) {
    return (
      <div className="flex w-full flex-col gap-3">
        <MethodChooser order={order} onDone={() => setIsChanging(false)} />
        {isChanging && (
          <button type="button" onClick={() => setIsChanging(false)} className="btn btn-ghost h-10 text-ink">
            Keep current payment
          </button>
        )}
      </div>
    );
  }

  if (payment.status === "UNDERPAID" || payment.status === "OVERPAID") {
    return (
      <p role="status" className="flex w-full items-start gap-2 rounded-box bg-warning/15 p-4 text-left text-sm text-ink">
        <PiWarningCircle aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-warning" />
        We received a different amount than your total. Our team will review it and contact you shortly.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {payment.method === "QRIS" && payment.qrString && (
        <>
          <div className="rounded-box border border-base-300 bg-white p-4">
            <QRCodeSVG value={payment.qrString} size={220} marginSize={0} title="QRIS payment code" />
          </div>
          <ol className="list-decimal space-y-1 pl-5 text-left text-sm text-ink-muted">
            <li>Open any e-wallet or mobile banking app that supports QRIS.</li>
            <li>Scan this QR code and check that the amount matches.</li>
            <li>Confirm the payment. This page updates on its own.</li>
          </ol>
        </>
      )}

      {payment.method === "VIRTUAL_ACCOUNT" && payment.vaNumber && (
        <>
          <div className="w-full rounded-box border border-base-300 p-4 text-center">
            <p className="text-sm text-ink-muted">{bankLabel(payment.vaBank)} Virtual Account number</p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="font-mono text-2xl font-bold tracking-wider text-ink">{payment.vaNumber}</span>
              <button
                type="button"
                onClick={() => copyText(payment.vaNumber!, "Account number")}
                aria-label="Copy account number"
                className="btn btn-ghost btn-square btn-sm size-9 text-ink-muted"
              >
                <PiCopySimple aria-hidden="true" size={18} />
              </button>
            </div>
          </div>
          <ol className="list-decimal space-y-1 pl-5 text-left text-sm text-ink-muted">
            <li>Open your {bankLabel(payment.vaBank)} app and choose transfer to Virtual Account.</li>
            <li>Enter the account number above. The exact amount appears automatically.</li>
            <li>Confirm the transfer. This page updates on its own.</li>
          </ol>
        </>
      )}

      <p aria-live="polite" className="flex items-center gap-2 text-sm text-ink-muted">
        <span aria-hidden="true" className="loading loading-dots loading-xs" />
        Waiting for your payment
      </p>

      <button type="button" onClick={() => setIsChanging(true)} className="btn btn-ghost btn-sm h-10 text-accent-text">
        Change payment method
      </button>

      {/* mode tes: tanpa MIDTRANS_SERVER_KEY, BE memakai gateway mock */}
      {payment.provider === "mock" && (
        <div className="flex w-full flex-col items-center gap-2 rounded-box border border-dashed border-info/50 bg-info-soft/40 p-3">
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <PiFlask aria-hidden="true" size={14} />
            Test mode: no real payment gateway is connected.
          </p>
          <button
            type="button"
            disabled={isSimulating}
            onClick={() =>
              simulate(payment.id, {
                onSuccess: () => toast.success("Test payment received."),
                onError: (error) => toast.error(getErrorMessage(error)),
              })
            }
            className="btn btn-outline btn-sm h-10"
          >
            {isSimulating && <span aria-hidden="true" className="loading loading-spinner loading-xs" />}
            Simulate successful payment
          </button>
        </div>
      )}
    </div>
  );
}
