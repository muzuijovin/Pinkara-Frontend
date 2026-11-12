import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { ProductCatalogSection } from "@/features/(public)/catalog/productCatalog";

export const metadata: Metadata = {
  title: "Flower Catalog | Pinkara Studio",
  description: "Browse fresh bouquets, bloom boxes, flower frames, and custom arrangements from Pinkara Studio.",
};

// katalog: filter kategori/tipe/harga/sembunyikan habis, urutan, search, 12 item per halaman, state di URL (PRD §6.2)
// ProductCatalogSection baca filter dari URL (useSearchParams) -> perlu Suspense karena cacheComponents aktif
export default function ProductCatalogPage() {
  return (
    <div className="bg-page">
      <Suspense fallback={<PageLoader />}>
        <ProductCatalogSection />
      </Suspense>
    </div>
  );
}
