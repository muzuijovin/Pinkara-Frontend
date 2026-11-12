"use client";

import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PiEnvelopeSimple, PiShoppingCartSimple } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { TextareaField } from "@/components/form/textareaField";
import { CheckoutSteps } from "@/components/ui/checkoutSteps";
import { CART_QUERY_KEY } from "@/features/(costumer)/cart/hooks/useCart";
import { ADDRESSES_QUERY_KEY, useAddresses } from "@/features/(costumer)/profile/hooks/useAddresses";
import { ResendVerificationButton } from "@/features/auth/components/resendVerificationButton";
import { CourierOptions, selectedOption } from "@/features/shipping/components/courierOptions";
import { SHIPPING_RATES_KEY, useShippingRates } from "@/features/shipping/hooks/useShippingRates";
import { SESSION_QUERY_KEY, useSession } from "@/features/auth/hooks/useSession";
import { formatRupiah } from "@/lib/currency.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { PaymentMethod, ShippingMethod } from "@/types/order.type";
import { CheckoutItems } from "./components/checkoutItems";
import { CheckoutSummary } from "./components/checkoutSummary";
import { PaymentMethodSection } from "./components/paymentMethodSection";
import { ShippingSection } from "./components/shippingSection";
import { getCheckoutError, useCheckoutPreview, usePlaceOrder } from "./hooks/useCheckout";

const NOTE_MAX = 500;

function CheckoutSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading checkout" className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-6">
        <div className="skeleton h-40 w-full" />
        <div className="skeleton h-56 w-full" />
        <div className="skeleton h-36 w-full" />
      </div>
      <div className="skeleton h-80 w-full" />
    </div>
  );
}

// keranjang kosong / berubah -> checkout tidak bisa dilanjutkan, arahkan kembali
function CheckoutBlocked({ title, message }: { title: string; message: string }) {
  return (
    <div className="card mx-auto max-w-lg border border-base-300 bg-base-100">
      <div className="card-body items-center gap-3 px-6 py-12 text-center">
        <PiShoppingCartSimple aria-hidden="true" size={44} className="text-ink-muted" />
        <div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <p className="text-sm text-ink-muted">{message}</p>
        </div>
        <Link href="/cart" className="btn btn-primary h-11">
          Back to cart
        </Link>
      </div>
    </div>
  );
}

// halaman checkout (PRD §7 no. 2–3): item, alamat & metode kirim, metode bayar, catatan, ringkasan.
// Figma: langkah 2 "Alamat & Jadwal" (1:1914)
export function CheckoutSection() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useSession();
  const { data: preview, isPending, isError, error, refetch } = useCheckoutPreview();
  const { data: addresses, isPending: isLoadingAddresses } = useAddresses();
  const { mutate: placeOrder, isPending: isPlacing } = usePlaceOrder();

  // 1 key per sesi checkout: klik dobel / request diulang setelah "server sibuk" tidak membuat pesanan ganda
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("COURIER");
  const [pickedAddressId, setPickedAddressId] = useState<string | null>(null);
  const [pickedCourierId, setPickedCourierId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QRIS");
  const [note, setNote] = useState("");
  // server menolak promo untuk pesanan ini (mis. kuota habis / nomor HP sudah pernah pakai)
  const [promoDropped, setPromoDropped] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [addressError, setAddressError] = useState<string>();

  // alamat terpilih: pilihan pembeli, kalau belum memilih -> alamat utama
  const addressId =
    (pickedAddressId && addresses?.some((address) => address.id === pickedAddressId) ? pickedAddressId : null) ??
    (addresses?.find((address) => address.isDefault) ?? addresses?.[0])?.id ??
    null;

  // pilihan kurir (Biteship) untuk alamat terpilih
  const shippingRates = useShippingRates({ addressId, enabled: shippingMethod === "COURIER" && Boolean(preview) });
  const courier = shippingMethod === "COURIER" ? selectedOption(shippingRates.data, pickedCourierId) : null;

  // admin tidak bisa checkout (dicek setelah semua hook dipanggil)
  if (user && user.role !== "CUSTOMER") {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-ink">Checkout is for customers</h1>
        <p className="mt-1 text-sm text-ink-muted">Admin accounts can&apos;t place orders.</p>
      </div>
    );
  }

  const checkoutError = getCheckoutError(error);
  const isEmailVerified = Boolean(user?.emailVerifiedAt);

  const discount = preview?.promo && !promoDropped ? preview.promo.discount : 0;
  const shippingFee = shippingMethod === "COURIER" ? (courier?.fee ?? 0) : (preview?.shippingOptions.find((option) => option.method === shippingMethod)?.fee ?? 0);
  const total = preview ? preview.subtotal + preview.addonTotal - discount + shippingFee : 0;

  const disabledReason = !isEmailVerified
    ? "Verify your email to place an order."
    : shippingMethod === "COURIER" && !addressId
      ? "Add a delivery address first."
      : shippingMethod === "COURIER" && !courier
        ? shippingRates.isPending
          ? "Loading delivery options..."
          : "Choose a delivery option."
        : undefined;

  const handlePlaceOrder = () => {
    if (!preview || disabledReason) return;
    setNotice(undefined);
    setAddressError(undefined);

    placeOrder(
      {
        idempotencyKey,
        shippingMethod,
        addressId: shippingMethod === "COURIER" ? (addressId ?? undefined) : undefined,
        courier: courier ? { courierCode: courier.courierCode, serviceCode: courier.serviceCode } : undefined,
        paymentMethod,
        buyerNote: note.trim() || undefined,
        expectedTotal: total,
      },
      {
        onSuccess: (order) => {
          toast.success("Order placed! Complete your payment to confirm it.");
          router.replace(`/orders/${order.code}/payment`);
        },
        onError: (err) => {
          const failure = getCheckoutError(err);

          switch (failure?.code) {
            case "PRICE_CHANGED": {
              // promo yang tampil ternyata tidak didapat -> hapus diskon dari tampilan
              if (failure.total !== undefined && discount > 0 && failure.total === total + discount) setPromoDropped(true);
              setNotice(
                `Your total has changed${failure.total !== undefined ? ` to ${formatRupiah(failure.total)}` : ""}. Please review it and place your order again.`,
              );
              refetch();
              queryClient.invalidateQueries({ queryKey: SHIPPING_RATES_KEY }); // ongkir bisa ikut berubah
              return;
            }
            case "SHIPPING_CHANGED":
              setNotice("Your delivery option is no longer available. Please choose another one.");
              setPickedCourierId(null);
              queryClient.invalidateQueries({ queryKey: SHIPPING_RATES_KEY });
              return;
            case "CART_CHANGED":
            case "CART_EMPTY":
              toast.error(getErrorMessage(err));
              queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
              router.push("/cart");
              return;
            case "ADDRESS_NOT_FOUND":
              setAddressError("This address is no longer available. Please choose another one.");
              queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
              return;
            case "CHECKOUT_BUSY":
              toast.info(getErrorMessage(err));
              return;
          }

          // 403 = email belum terverifikasi (dicek BE dari DB) -> perbarui session supaya banner muncul
          if (isAxiosError(err) && err.response?.status === 403) {
            queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
          }
          toast.error(getErrorMessage(err, "Couldn't place your order. Please try again."));
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <CheckoutSteps current={1} />
      <h1 className="mt-6 text-2xl font-bold text-ink md:text-3xl">Checkout</h1>

      <div className="mt-6">
        {isPending && <CheckoutSkeleton />}

        {checkoutError?.code === "CART_EMPTY" && (
          <CheckoutBlocked title="Your cart is empty" message="Add something you love before checking out." />
        )}
        {checkoutError?.code === "CART_CHANGED" && (
          <CheckoutBlocked title="Your cart needs attention" message={getErrorMessage(error)} />
        )}
        {isError && !checkoutError && (
          <div className="flex flex-col gap-3">
            <FormAlert message={getErrorMessage(error, "Couldn't load checkout.")} />
            <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
              Try again
            </button>
          </div>
        )}

        {preview && (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
            <div className="flex min-w-0 flex-col gap-6">
              {user && !isEmailVerified && (
                <div role="alert" className="alert flex-col items-start gap-3 border-warning/40 bg-warning/15 sm:flex-row sm:items-center">
                  <PiEnvelopeSimple aria-hidden="true" size={22} className="shrink-0 text-warning" />
                  <p className="flex-1 text-sm text-ink">
                    Please verify your email ({user.email}) before placing an order.
                  </p>
                  <ResendVerificationButton className="btn-sm h-10" />
                </div>
              )}

              <CheckoutItems items={preview.items} />

              <ShippingSection
                options={preview.shippingOptions}
                method={shippingMethod}
                onMethodChange={setShippingMethod}
                addresses={addresses}
                isLoadingAddresses={isLoadingAddresses}
                addressId={addressId}
                onAddressChange={(id) => {
                  setPickedAddressId(id);
                  setAddressError(undefined);
                }}
                addressError={addressError}
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

              <PaymentMethodSection options={preview.paymentOptions} method={paymentMethod} onChange={setPaymentMethod} />

              <section aria-label="Note" className="card border border-base-300 bg-base-100">
                <div className="card-body p-5 sm:p-6">
                  <TextareaField
                    id="buyer-note"
                    label="Note for us (optional)"
                    rows={3}
                    maxLength={NOTE_MAX}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="e.g. Please call before delivery, or leave it with the building reception."
                    count={{ value: note.length, max: NOTE_MAX }}
                  />
                </div>
              </section>
            </div>

            <CheckoutSummary
              subtotal={preview.subtotal}
              addonTotal={preview.addonTotal}
              discount={discount}
              promoName={preview.promo?.name ?? null}
              promoRemaining={preview.promo?.remaining ?? null}
              shippingFee={shippingFee}
              total={total}
              notice={notice}
              disabledReason={disabledReason}
              isPending={isPlacing}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        )}
      </div>
    </div>
  );
}
