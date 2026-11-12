import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { AdminOrderDetail } from "@/features/admin/orders/adminOrderDetail";

export const metadata: Metadata = { title: "Order | Pinkara Admin" };

// detail pesanan + lembar kerja pengemasan, ubah status, input kurir & resi (PRD §12)
// AdminOrderDetail baca kode pakai useParams (route dinamis) -> perlu Suspense karena cacheComponents aktif
export default function AdminOrderDetailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminOrderDetail />
    </Suspense>
  );
}
