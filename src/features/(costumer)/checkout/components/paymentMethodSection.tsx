import { PiBank, PiQrCode } from "react-icons/pi";
import { BankPicker } from "@/features/(costumer)/orders/components/bankPicker";
import type { PaymentMethod, VaBank } from "@/types/order.type";
import { OptionCard } from "./optionCard";

const PAYMENT_COPY: Record<PaymentMethod, { title: string; description: string; icon: React.ReactNode }> = {
  QRIS: {
    title: "QRIS",
    description: "Scan with any e-wallet or mobile banking app.",
    icon: <PiQrCode size={20} />,
  },
  VIRTUAL_ACCOUNT: {
    title: "Bank transfer (Virtual Account)",
    description: "Transfer from any bank app. Confirmed automatically.",
    icon: <PiBank size={20} />,
  },
  MANUAL_TRANSFER: {
    title: "Manual bank transfer",
    description: "Transfer to our account and upload the receipt.",
    icon: <PiBank size={20} />,
  },
};

// batas bayar dari BE: 15 menit -> "15 minutes", 1440 -> "24 hours"
function formatDeadline(minutes: number) {
  return minutes >= 60 ? `${minutes / 60} hours` : `${minutes} minutes`;
}

type PaymentMethodSectionProps = {
  options: { method: PaymentMethod; expiresInMinutes: number }[];
  method: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  bank: VaBank;
  onBankChange: (bank: VaBank) => void;
};

// metode bayar (+ bank untuk VA) dipilih saat checkout: menentukan batas waktu bayar (PRD §7 & §9) dan
// tagihan langsung dibuat setelah pesanan jadi, tanpa memilih ulang di halaman bayar
export function PaymentMethodSection({ options, method, onChange, bank, onBankChange }: PaymentMethodSectionProps) {
  return (
    <section aria-labelledby="payment-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-4 p-5 sm:p-6">
        <header>
          <h2 id="payment-title" className="text-lg font-semibold text-ink">
            Payment method
          </h2>
          <p className="text-sm text-ink-muted">Your QR code or account number appears right after you confirm.</p>
        </header>

        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">Payment method</legend>
          {options.map(({ method: option, expiresInMinutes }) => (
            <OptionCard
              key={option}
              name="paymentMethod"
              value={option}
              checked={method === option}
              onChange={(value) => onChange(value as PaymentMethod)}
              icon={PAYMENT_COPY[option].icon}
              title={PAYMENT_COPY[option].title}
              description={
                <>
                  {PAYMENT_COPY[option].description}
                  <br />
                  Pay within {formatDeadline(expiresInMinutes)}.
                </>
              }
            />
          ))}
        </fieldset>

        {method === "VIRTUAL_ACCOUNT" && <BankPicker name="checkout-va-bank" value={bank} onChange={onBankChange} />}
      </div>
    </section>
  );
}
