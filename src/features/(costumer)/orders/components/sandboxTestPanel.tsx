"use client";

import { PiArrowSquareOut, PiArrowsClockwise, PiCopySimple, PiFlask } from "react-icons/pi";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/lib/error.lib";
import type { OrderPayment } from "@/types/order.type";
import { useRefreshSandboxPayment } from "../hooks/useOrder";
import { bankLabel, copyText } from "../utils/payment";

type SandboxTestPanelProps = {
  code: string;
  payment: OrderPayment;
  sandbox: NonNullable<OrderPayment["sandbox"]>;
};

// KHUSUS kunci sandbox Midtrans: cara bayar lewat simulator Midtrans (tanpa uang sungguhan).
// Webhook tidak sampai ke localhost -> setelah bayar, tekan "Check payment status" (atau tunggu cron ±1 menit)
export function SandboxTestPanel({ code, payment, sandbox }: SandboxTestPanelProps) {
  const { mutate: refresh, isPending } = useRefreshSandboxPayment(code);
  const isQris = payment.method === "QRIS";
  const copyValue = isQris ? sandbox.qrImageUrl : payment.vaNumber;

  const checkStatus = () =>
    refresh(payment.id, {
      onSuccess: (order) => {
        if (order.payment?.status === "PAID") toast.success("Test payment received.");
        else toast.info("Not paid yet. Finish the payment in the simulator, then check again.");
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });

  return (
    <section
      aria-labelledby="sandbox-test-title"
      className="flex w-full flex-col gap-3 rounded-box border border-dashed border-info/50 bg-info-soft/40 p-4 text-left"
    >
      <h2 id="sandbox-test-title" className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        <PiFlask aria-hidden="true" size={16} />
        Sandbox test
        <span className="font-normal text-ink-muted">· no real money is charged</span>
      </h2>

      <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-muted">
        <li>
          {isQris ? "Copy the QR image link." : `Copy the ${bankLabel(payment.vaBank)} account number.`}
          {copyValue && (
            <button
              type="button"
              onClick={() => copyText(copyValue, isQris ? "QR image link" : "Account number")}
              className="btn btn-outline btn-xs ml-2 h-8 gap-1 border-base-300 align-middle text-ink"
            >
              <PiCopySimple aria-hidden="true" size={14} />
              {isQris ? "Copy link" : "Copy number"}
            </button>
          )}
        </li>
        <li>
          Open the{" "}
          <a
            href={sandbox.simulatorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-accent-text underline underline-offset-2"
          >
            Midtrans {isQris ? "QRIS" : bankLabel(payment.vaBank)} simulator
            <PiArrowSquareOut aria-hidden="true" size={14} />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          , paste it{isQris ? " and click Scan QR" : " and click Inquire"}, then click Pay.
        </li>
        <li>Come back here and check the payment status. It also updates by itself within about a minute.</li>
      </ol>

      <button type="button" onClick={checkStatus} disabled={isPending} className="btn btn-outline btn-sm h-10 gap-1.5 self-start border-base-300 text-ink">
        {isPending ? <span aria-hidden="true" className="loading loading-spinner loading-xs" /> : <PiArrowsClockwise aria-hidden="true" size={16} />}
        Check payment status
      </button>
    </section>
  );
}
