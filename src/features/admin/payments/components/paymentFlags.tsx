import { PiClockCountdown, PiWarningCircle } from "react-icons/pi";
import type { AdminPayment } from "@/types/adminPayment.type";

// penanda tambahan di baris tagihan: perlu perhatian / dibayar setelah batas waktu (ikon + teks, bukan warna saja)
export function PaymentFlags({ payment }: { payment: Pick<AdminPayment, "attention" | "paidLate"> }) {
  if (!payment.attention && !payment.paidLate) return null;
  return (
    <span className="flex flex-col gap-0.5 text-xs">
      {payment.attention && (
        <span className="inline-flex items-center gap-1 font-medium text-danger-text">
          <PiWarningCircle aria-hidden="true" size={13} />
          {payment.attention}
        </span>
      )}
      {payment.paidLate && (
        <span className="inline-flex items-center gap-1 text-ink-muted">
          <PiClockCountdown aria-hidden="true" size={13} />
          Paid after the time limit
        </span>
      )}
    </span>
  );
}
