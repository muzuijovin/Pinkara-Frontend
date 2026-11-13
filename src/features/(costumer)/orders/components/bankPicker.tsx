"use client";

import type { VaBank } from "@/types/order.type";
import { BANKS } from "../utils/payment";

type BankPickerProps = {
  name: string; // nama grup radio (unik per form)
  value: VaBank;
  onChange: (bank: VaBank) => void;
};

// pilih bank Virtual Account (BCA / BNI / BRI / Permata). Dipakai di checkout & halaman bayar
export function BankPicker({ name, value, onChange }: BankPickerProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold text-ink">Choose your bank</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BANKS.map((item) => (
          <label
            key={item.value}
            className={`flex h-11 cursor-pointer items-center justify-center rounded-box border text-sm font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${
              value === item.value ? "border-primary bg-accent-soft/30 text-accent-text" : "border-base-300 text-ink hover:border-primary/50"
            }`}
          >
            <input type="radio" name={name} value={item.value} checked={value === item.value} onChange={() => onChange(item.value)} className="sr-only" />
            {item.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
