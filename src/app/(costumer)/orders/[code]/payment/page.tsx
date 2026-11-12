import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { OrderPayment } from "@/features/(costumer)/orders/orderPayment";

export const metadata: Metadata = { title: "Payment | Pinkara Studio" };

// halaman bayar: hitung mundur dari expiresAt server + tagihan (PRD §9). QR / VA menyusul di feat/payment.
// OrderPayment baca kode pesanan pakai useParams (route dinamis) -> perlu Suspense karena cacheComponents aktif
export default function OrderPaymentPage() {
  return (
    <div className="bg-page">
      <Suspense fallback={<PageLoader />}>
        <OrderPayment />
      </Suspense>
    </div>
  );
}
