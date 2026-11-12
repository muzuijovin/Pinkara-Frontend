import Link from "next/link";
import { PiArrowRight } from "react-icons/pi";
import { ProductCard } from "@/components/product/productCard";
import { categoryHref } from "@/features/categories/hooks/useCategories";
import type { ProductDetail } from "@/types/product.type";

// produk terkait: kategori yang sama, maks 4 (PRD §6.3)
export function RelatedProducts({ product }: { product: ProductDetail }) {
  if (!product.relatedProducts.length) return null;

  return (
    <section aria-labelledby="related-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="related-title" className="text-xl font-bold text-ink md:text-2xl">
          You may also like
        </h2>
        <Link
          href={categoryHref(product.category.slug)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent-text hover:underline"
        >
          More {product.category.name}
          <PiArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {product.relatedProducts.map((related) => (
          <li key={related.id}>
            <ProductCard product={related} />
          </li>
        ))}
      </ul>
    </section>
  );
}
