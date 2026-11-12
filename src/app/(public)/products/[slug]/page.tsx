import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { ProductDetailSection } from "@/features/(public)/productDetail/productDetail";

export const metadata: Metadata = { title: "Product | Pinkara Studio" };

// detail produk: varian, add-on, stok, Pesan Custom, produk terkait (PRD §6.3). Figma: Detail Produk (1:2)
// ProductDetailSection baca slug pakai useParams (route dinamis) -> perlu Suspense karena cacheComponents aktif
export default function ProductDetailPage() {
  return (
    <div className="bg-page">
      <Suspense fallback={<PageLoader />}>
        <ProductDetailSection />
      </Suspense>
    </div>
  );
}
