import Link from "next/link";
import { PiMapPinLine, PiStorefront, PiTruck } from "react-icons/pi";
import { formatRupiah } from "@/lib/currency.lib";
import type { ShippingMethod } from "@/types/order.type";
import type { Address } from "@/types/profile.type";
import { OptionCard } from "./optionCard";

const SHIPPING_COPY: Record<ShippingMethod, { title: string; description: string; icon: React.ReactNode }> = {
  COURIER: {
    title: "Delivery",
    description: "Delivered to your address by our courier.",
    icon: <PiTruck size={20} />,
  },
  PICKUP: {
    title: "Pick up at studio",
    description: "Collect it yourself. We'll let you know when it's ready.",
    icon: <PiStorefront size={20} />,
  },
};

type ShippingSectionProps = {
  options: { method: ShippingMethod; fee: number }[];
  method: ShippingMethod;
  onMethodChange: (method: ShippingMethod) => void;
  addresses: Address[] | undefined;
  isLoadingAddresses: boolean;
  addressId: string | null;
  onAddressChange: (id: string) => void;
  addressError?: string;
};

// metode kirim + alamat tujuan (PRD §7 no. 2). Alamat dikelola di Profil -> Addresses
export function ShippingSection({
  options,
  method,
  onMethodChange,
  addresses,
  isLoadingAddresses,
  addressId,
  onAddressChange,
  addressError,
}: ShippingSectionProps) {
  return (
    <section aria-labelledby="shipping-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-5 p-5 sm:p-6">
        <h2 id="shipping-title" className="text-lg font-semibold text-ink">
          Delivery
        </h2>

        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">Delivery method</legend>
          {options.map(({ method: option, fee }) => (
            <OptionCard
              key={option}
              name="shippingMethod"
              value={option}
              checked={method === option}
              onChange={(value) => onMethodChange(value as ShippingMethod)}
              icon={SHIPPING_COPY[option].icon}
              title={SHIPPING_COPY[option].title}
              description={SHIPPING_COPY[option].description}
              aside={fee ? formatRupiah(fee) : "Free"}
            />
          ))}
        </fieldset>

        {method === "COURIER" && (
          <fieldset className="flex flex-col gap-3" aria-describedby={addressError ? "address-error" : undefined}>
            <legend className="mb-3 flex w-full items-center justify-between gap-3 text-sm font-semibold text-ink">
              Delivery address
              <Link href="/profile?tab=addresses" className="text-sm font-medium text-accent-text hover:underline">
                Manage addresses
              </Link>
            </legend>

            {isLoadingAddresses && <div className="skeleton h-20 w-full" />}

            {addresses?.length === 0 && (
              <div className="flex flex-col items-start gap-3 rounded-box border border-dashed border-base-300 p-4">
                <p className="text-sm text-ink-muted">You don&apos;t have a saved address yet.</p>
                <Link href="/profile?tab=addresses" className="btn btn-outline btn-primary btn-sm h-10 gap-1.5">
                  <PiMapPinLine aria-hidden="true" size={16} />
                  Add an address
                </Link>
              </div>
            )}

            {addresses?.map((address) => (
              <OptionCard
                key={address.id}
                name="addressId"
                value={address.id}
                checked={addressId === address.id}
                onChange={onAddressChange}
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    {address.recipientName}
                    <span className="font-normal text-ink-muted">{address.recipientPhone}</span>
                    {address.label && (
                      <span className="badge badge-sm border-none bg-surface-sunken font-medium text-ink-muted">
                        {address.label}
                      </span>
                    )}
                    {address.isDefault && (
                      <span className="badge badge-sm border-none bg-accent-soft font-medium text-accent-text">Default</span>
                    )}
                  </span>
                }
                description={`${address.fullAddress}, ${address.city} ${address.postalCode}`}
              />
            ))}

            {addressError && (
              <p id="address-error" role="alert" className="text-xs text-danger-text">
                {addressError}
              </p>
            )}
          </fieldset>
        )}
      </div>
    </section>
  );
}
