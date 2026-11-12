import Link from "next/link";
import { PiLightning } from "react-icons/pi";
import { categoryHref } from "@/features/categories/hooks/useCategories";
import { formatPriceRange, formatRupiah } from "@/lib/currency.lib";
import type { ProductDetail } from "@/types/product.type";

type ProductSummaryProps = {
  product: ProductDetail;
  selectedVariant?: ProductDetail["variants"][number];
};

// kategori, nama, harga (ikut varian terpilih), info stok & pengiriman (PRD §6.3)
export function ProductSummary({ product, selectedVariant }: ProductSummaryProps) {
  const isCustom = product.type === "CUSTOM";
  const stock = selectedVariant?.stock;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href={categoryHref(product.category.slug)}
          className="text-xs font-semibold uppercase tracking-wider text-accent-text hover:underline"
        >
          {product.category.name}
        </Link>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-ink md:text-3xl">{product.name}</h1>
      </div>

      <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
        {isCustom && <span className="w-full text-xs text-ink-muted">Starting from</span>}
        <p className="text-3xl font-bold tabular-nums text-accent-text">
          {isCustom
            ? formatRupiah(product.basePrice ?? product.minPrice)
            : selectedVariant
              ? formatRupiah(selectedVariant.price)
              : formatPriceRange(product.minPrice, product.maxPrice)}
        </p>
        {!isCustom && stock !== undefined && (
          <p
            className={`pb-1 text-sm font-medium ${
              stock === 0 ? "text-danger-text" : stock <= 3 ? "text-warning-content" : "text-success-text"
            }`}
          >
            {stock === 0 ? "Out of stock" : stock <= 3 ? `Only ${stock} left` : "In stock"}
          </p>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-box bg-info-soft p-3 text-sm text-ink">
        <PiLightning aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-tertiary" />
        <p>
          {isCustom ? (
            <>
              <strong>Made to order.</strong> Send a brief, chat with our florist, and get a quote with the price and
              ready date{product.productionDays ? ` (usually ${product.productionDays} days)` : ""}.
            </>
          ) : (
            <>
              <strong>Same-day delivery</strong> across Jabodetabek for orders paid before 3:00 PM WIB.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
