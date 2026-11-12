import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { OrderList } from "@/features/(costumer)/orders/orderList";

export const metadata: Metadata = { title: "My Orders | Pinkara Studio" };

// Pesanan Saya: pesanan aktif + riwayat + status (PRD §6.4, §11). Figma: Pesanan Saya (1:2384), mobile (1:3217)
// OrderList baca ?status=&page= (useSearchParams) -> perlu Suspense karena cacheComponents aktif
export default function OrdersPage() {
  return (
    <div className="bg-page">
      <Suspense fallback={<PageLoader />}>
        <OrderList />
      </Suspense>
    </div>
  );
}
