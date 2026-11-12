import { ProductCard, ProductCardSkeleton } from "@/components/product/productCard";
import type { ProductCardItem } from "@/types/product.type";
import { CATALOG_PAGE_SIZE } from "../hooks/useProducts";

const GRID_CLASS = "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3";

// grid produk: 2 kolom di HP, 3 kolom dari tablet ke atas (Figma 1:808)
export function ProductGrid({ products, isLoading }: { products: ProductCardItem[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className={GRID_CLASS} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: CATALOG_PAGE_SIZE }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <ul className={GRID_CLASS}>
      {products.map((product, index) => (
        <li key={product.id}>
          {/* 3 kartu pertama terlihat tanpa scroll -> dimuat lebih dulu (LCP), sisanya lazy */}
          <ProductCard product={product} priority={index < 3} />
        </li>
      ))}
    </ul>
  );
}
