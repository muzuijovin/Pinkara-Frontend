import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { AdminOrderTable } from "@/features/admin/orders/adminOrderTable";

export const metadata: Metadata = { title: "Orders | Pinkara Admin" };

// daftar pesanan masuk (PRD §12). Akses ADMIN dijaga RequireAuth di admin/layout.tsx
// AdminOrderTable baca ?status=&search=&page= (useSearchParams) -> perlu Suspense karena cacheComponents aktif
export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminOrderTable />
    </Suspense>
  );
}
