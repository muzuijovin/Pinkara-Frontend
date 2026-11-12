import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { AdminDashboardSection } from "@/features/admin/dashboard/adminDashboard";

export const metadata: Metadata = { title: "Dashboard | Pinkara Admin" };

// dashboard admin: perlu tindakan, ringkasan penjualan, stok & promo, aktivitas (PRD §12.2)
// AdminDashboardSection baca ?period= / ?from=&to= (useSearchParams) -> perlu Suspense karena cacheComponents aktif
export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminDashboardSection />
    </Suspense>
  );
}
