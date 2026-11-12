import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { AdminCustomRequestDetail } from "@/features/admin/customRequests/customRequestDetail";

export const metadata: Metadata = { title: "Custom Request | Pinkara Admin" };

// diskusi custom, buat / tarik penawaran, batalkan request (PRD §8, §12). [id] = kode request (CST-…)
// AdminCustomRequestDetail baca kode pakai useParams (route dinamis) -> perlu Suspense karena cacheComponents aktif
export default function AdminCustomRequestDetailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminCustomRequestDetail />
    </Suspense>
  );
}
