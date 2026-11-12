import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { OrderDetail } from "@/features/(costumer)/orders/orderDetail";

export const metadata: Metadata = { title: "Order Details | Pinkara Studio" };

// detail pesanan by kode (mis. PNK-261104-7Q3K, bukan id internal) + riwayat status (PRD §11, §14)
// OrderDetail baca kode pakai useParams (route dinamis) -> perlu Suspense karena cacheComponents aktif
export default function OrderDetailPage() {
  return (
    <div className="bg-page">
      <Suspense fallback={<PageLoader />}>
        <OrderDetail />
      </Suspense>
    </div>
  );
}
