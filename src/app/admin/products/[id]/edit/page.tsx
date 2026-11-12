import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { EditProduct } from "@/features/admin/products/editProduct";

export const metadata: Metadata = { title: "Edit Product | Pinkara Admin" };

// edit produk (PRD §12.1c). Akses ADMIN dijaga RequireAuth di admin/layout.tsx
// EditProduct baca id pakai useParams (route dinamis) -> perlu Suspense karena cacheComponents aktif
export default function AdminEditProductPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <EditProduct />
    </Suspense>
  );
}
