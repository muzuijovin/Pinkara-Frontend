"use client";

import Link from "next/link";
import { PiClock, PiInfo, PiLightning, PiMapPinLine, PiRocketLaunch, PiTruck } from "react-icons/pi";
import { FormAlert } from "@/components/form/formAlert";
import { OptionCard } from "@/features/(costumer)/checkout/components/optionCard";
import { formatRupiah } from "@/lib/currency.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { ShippingOption, ShippingRates, ShippingRateType } from "@/types/shipping.type";

const TYPE_INFO: Record<ShippingRateType, { label: string; icon: React.ReactNode }> = {
  INSTANT: { label: "Instant", icon: <PiLightning size={20} /> },
  SAME_DAY: { label: "Same day", icon: <PiClock size={20} /> },
  REGULAR: { label: "Regular", icon: <PiTruck size={20} /> },
  EXPRESS: { label: "Next day", icon: <PiRocketLaunch size={20} /> },
};

// pilihan terpilih: yang dipilih pembeli kalau masih ada, kalau tidak -> pilihan pertama (instan / termurah)
export function selectedOption(rates: ShippingRates | undefined, pickedId: string | null): ShippingOption | null {
  if (!rates?.options.length) return null;
  return rates.options.find((option) => option.id === pickedId) ?? rates.options[0];
}

type CourierOptionsProps = {
  rates: ShippingRates | undefined;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  selectedId: string | null;
  onChange: (id: string) => void;
};

// daftar kurir untuk alamat terpilih: JNE & J&T (reguler / express) + GoSend & Grab kalau dekat studio.
// Nama layanan sudah disederhanakan di BE (cargo / trucking tidak ditampilkan)
export function CourierOptions({ rates, isPending, error, onRetry, selectedId, onChange }: CourierOptionsProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-sm font-semibold text-ink">Delivery option</legend>

      {isPending && (
        <div aria-busy="true" aria-label="Loading delivery options" className="flex flex-col gap-3">
          <div className="skeleton h-18 w-full" />
          <div className="skeleton h-18 w-full" />
        </div>
      )}

      {Boolean(error) && !isPending && (
        <div className="flex flex-col gap-2">
          <FormAlert message={getErrorMessage(error, "Couldn't load delivery options.")} />
          <button type="button" onClick={onRetry} className="btn btn-outline btn-sm self-start">
            Try again
          </button>
        </div>
      )}

      {rates && !rates.hasPin && (
        <p className="flex items-start gap-2 rounded-box bg-info-soft px-3 py-2.5 text-xs text-ink">
          <PiMapPinLine aria-hidden="true" size={16} className="mt-px shrink-0" />
          <span>
            Want it today? Pin this address on the map to see same-day couriers like GoSend and Grab.{" "}
            <Link href="/profile?tab=addresses" className="font-medium text-accent-text underline underline-offset-2">
              Add a pin
            </Link>
          </span>
        </p>
      )}

      {rates?.fallback && (
        <p className="flex items-start gap-2 text-xs text-ink-muted">
          <PiInfo aria-hidden="true" size={16} className="mt-px shrink-0" />
          Live courier rates are unavailable right now, so we&apos;re showing our standard delivery fee.
        </p>
      )}

      {rates?.options.map((option) => (
        <OptionCard
          key={option.id}
          name="courier"
          value={option.id}
          checked={selectedOption(rates, selectedId)?.id === option.id}
          onChange={onChange}
          icon={TYPE_INFO[option.type].icon}
          title={
            <span className="flex flex-wrap items-center gap-2">
              {option.serviceName}
              {option.type !== "REGULAR" && (
                <span className="badge badge-sm border-none bg-accent-soft font-medium text-accent-text">{TYPE_INFO[option.type].label}</span>
              )}
            </span>
          }
          description={option.eta ? `Estimated ${option.eta.toLowerCase()}` : undefined}
          aside={formatRupiah(option.fee)}
        />
      ))}
    </fieldset>
  );
}
