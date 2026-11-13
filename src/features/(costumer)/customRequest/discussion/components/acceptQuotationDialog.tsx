"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { PaymentMethodSection } from "@/features/(costumer)/checkout/components/paymentMethodSection";
import { ShippingSection } from "@/features/(costumer)/checkout/components/shippingSection";
import { getCheckoutError } from "@/features/(costumer)/checkout/hooks/useCheckout";
import { useAddresses } from "@/features/(costumer)/profile/hooks/useAddresses";
import { useSession } from "@/features/auth/hooks/useSession";
import { formatRupiah } from "@/lib/currency.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { CustomRequestDetail, Quotation } from "@/types/customRequest.type";
import type { PaymentMethod, ShippingMethod, VaBank } from "@/types/order.type";
import { CourierOptions, selectedOption } from "@/features/shipping/components/courierOptions";
import { SHIPPING_RATES_KEY, useShippingRates } from "@/features/shipping/hooks/useShippingRates";
import { useQueryClient } from "@tanstack/react-query";
import { useAcceptQuotation } from "../../hooks/useCustomRequests";
import { pickReadyAddress } from "@/features/shipping/utils/address";

type AcceptQuotationDialogProps = {
  request: CustomRequestDetail;
  quotation: Quotation;
  onClose: () => void;
};

// "Accept & pay" (PRD §8 no. 4): pilih pengiriman & metode bayar -> pesanan custom dibuat -> halaman bayar.
// Versi penawaran yang dilihat pembeli ikut dikirim; kalau sudah berubah, BE menolak (PRD §13.7)
export function AcceptQuotationDialog({ request, quotation, onClose }: AcceptQuotationDialogProps) {
  const router = useRouter();
  const { data: user } = useSession();
  const { data: addresses, isPending: isLoadingAddresses } = useAddresses();
  const { mutate: accept, isPending } = useAcceptQuotation(request.code);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("COURIER");
  const queryClient = useQueryClient();
  const [pickedAddressId, setPickedAddressId] = useState<string | null>(null);
  const [pickedCourierId, setPickedCourierId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QRIS");
  const [vaBank, setVaBank] = useState<VaBank>("bca");

  const addressId = pickReadyAddress(addresses, pickedAddressId);
  // pilihan kurir dihitung dari isi penawaran (ukuran kardus) ke alamat terpilih
  const shippingRates = useShippingRates({ addressId, quotationId: quotation.id, enabled: shippingMethod === "COURIER" });
  const courier = shippingMethod === "COURIER" ? selectedOption(shippingRates.data, pickedCourierId) : null;
  const shippingFee = shippingMethod === "COURIER" ? (courier?.fee ?? 0) : (request.shippingOptions.find((option) => option.method === shippingMethod)?.fee ?? 0);
  const total = quotation.total + shippingFee;

  const disabledReason = !user?.emailVerifiedAt
    ? "Please verify your email before paying."
    : shippingMethod === "COURIER" && !addressId
      ? addresses?.length
        ? "Update your address with its district and map pin first."
        : "Add a delivery address first."
      : shippingMethod === "COURIER" && !courier
        ? shippingRates.isPending
          ? "Loading delivery options..."
          : "Choose a delivery option."
        : undefined;

  const submit = () =>
    accept(
      {
        quotationId: quotation.id,
        version: quotation.version,
        shippingMethod,
        addressId: shippingMethod === "COURIER" ? (addressId ?? undefined) : undefined,
        courier: courier ? { courierCode: courier.courierCode, serviceCode: courier.serviceCode } : undefined,
        paymentMethod,
        vaBank,
        expectedTotal: total,
      },
      {
        onSuccess: (order) => {
          toast.success("Quote accepted! Complete your payment to start production.");
          // tagihan gagal dibuat (gateway gangguan) -> halaman bayar menampilkan pilihan metode untuk dicoba lagi
          if (!order.payment) toast.info("We couldn't prepare your payment yet. Choose how to pay on the next page to try again.");
          router.push(`/orders/${order.code}/payment`);
        },
        onError: (error) => {
          const failure = getCheckoutError(error) as { code?: string } | null;
          toast.error(getErrorMessage(error, "Couldn't accept the quote. Please try again."));
          // ongkir berubah / layanan kurir tidak tersedia lagi -> ambil ulang pilihan kurir
          if (failure?.code === "SHIPPING_CHANGED" || failure?.code === "PRICE_CHANGED") {
            setPickedCourierId(null);
            queryClient.invalidateQueries({ queryKey: SHIPPING_RATES_KEY });
          }
          if (failure?.code === "QUOTATION_CHANGED" || failure?.code === "QUOTATION_EXPIRED") onClose();
        },
      },
    );

  return (
    <dialog
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      onClose={onClose}
      aria-labelledby="accept-title"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="modal-box flex max-h-[90dvh] max-w-2xl flex-col gap-4 bg-page p-0">
        <header className="border-b border-base-300 bg-base-100 px-5 py-4">
          <h3 id="accept-title" className="text-lg font-semibold text-ink">
            Accept quote & pay
          </h3>
          <p className="text-sm text-ink-muted">Choose how you&apos;d like to receive it and how to pay.</p>
        </header>

        <div className="flex flex-col gap-4 overflow-y-auto px-5">
          <ShippingSection
            options={request.shippingOptions}
            method={shippingMethod}
            onMethodChange={setShippingMethod}
            addresses={addresses}
            isLoadingAddresses={isLoadingAddresses}
            addressId={addressId}
            onAddressChange={setPickedAddressId}
            courierFee={courier?.fee ?? null}
          >
            {addressId && (
              <CourierOptions
                rates={shippingRates.data}
                isPending={shippingRates.isPending}
                error={shippingRates.error}
                onRetry={() => shippingRates.refetch()}
                selectedId={courier?.id ?? null}
                onChange={setPickedCourierId}
              />
            )}
          </ShippingSection>
          <PaymentMethodSection
            options={request.paymentOptions}
            method={paymentMethod}
            onChange={setPaymentMethod}
            bank={vaBank}
            onBankChange={setVaBank}
          />
        </div>

        <footer className="flex flex-col gap-3 border-t border-base-300 bg-base-100 px-5 py-4">
          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Quote</dt>
              <dd className="tabular-nums text-ink">{formatRupiah(quotation.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Shipping</dt>
              <dd className="tabular-nums text-ink">{shippingFee ? formatRupiah(shippingFee) : "Free"}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt className="text-ink">Total</dt>
              <dd className="tabular-nums text-accent-text">{formatRupiah(total)}</dd>
            </div>
          </dl>
          {disabledReason && <p className="text-xs text-danger-text">{disabledReason}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <form method="dialog">
              <button disabled={isPending} className="btn btn-ghost h-11 w-full text-ink sm:w-auto">
                Cancel
              </button>
            </form>
            <button type="button" disabled={Boolean(disabledReason) || isPending} onClick={submit} className="btn btn-primary h-11">
              {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
              {isPending ? "Placing your order..." : `Accept & pay ${formatRupiah(total)}`}
            </button>
          </div>
          {isPending && (
            <p role="status" className="text-right text-xs text-ink-muted">
              Preparing your order and payment. This can take a few seconds.
            </p>
          )}
        </footer>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close">close</button>
      </form>
    </dialog>
  );
}
