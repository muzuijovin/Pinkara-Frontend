import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { ProductTable } from "@/features/admin/products/productTable";

export const metadata: Metadata = { title: "Products | Pinkara Admin" };

// daftar produk admin + tombol Add product (PRD §12.1a)
// ProductTable baca ?page=&search=&status= (useSearchParams) -> perlu Suspense karena cacheComponents aktif
export default function AdminProductsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProductTable />
    </Suspense>
  );
}
