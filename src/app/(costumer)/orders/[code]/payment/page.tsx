import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { OrderPayment } from "@/features/(costumer)/orders/orderPayment";

export const metadata: Metadata = { title: "Payment | Pinkara Studio" };

// halaman bayar: hitung mundur dari expiresAt server + QR / nomor VA, status dicek tiap 5 detik (PRD §9).
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
