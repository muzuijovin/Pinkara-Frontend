import Image from "next/image";
import Link from "next/link";
import { PiImageSquare } from "react-icons/pi";
import { formatPriceRange, formatRupiah } from "@/lib/currency.lib";
import type { ProductCardItem } from "@/types/product.type";

// stok sedikit -> badge "Only N left" (PRD §6.2: badge "Sisa 1")
const LOW_STOCK_THRESHOLD = 3;

type ProductCardProps = {
  product: ProductCardItem;
  // true untuk kartu di atas lipatan layar (gambar dimuat lebih dulu)
  priority?: boolean;
};

// kartu produk: dipakai di katalog, produk unggulan landing & produk terkait — Figma 1:808
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const cover = product.images[0];
  const isCustom = product.type === "CUSTOM";
  const isSoldOut = product.totalStock === 0;
  const isLowStock = product.totalStock !== null && product.totalStock > 0 && product.totalStock <= LOW_STOCK_THRESHOLD;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-box border border-base-300 bg-base-100 transition-shadow duration-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-muted">
        {cover ? (
          <Image
            src={cover}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 290px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 50vw"
            className={`object-cover transition-transform duration-300 motion-safe:group-hover:scale-105 ${
              isSoldOut ? "opacity-60 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-ink-muted">
            <PiImageSquare aria-hidden="true" size={40} />
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          <span
            className={`badge badge-sm border-none font-medium ${
              isCustom ? "bg-accent-soft text-accent-text" : "bg-success-soft text-success-text"
            }`}
          >
            {isCustom ? "Custom Order" : "Ready Stock"}
          </span>
          {isLowStock && (
            <span className="badge badge-sm border-none bg-warning/90 font-medium text-ink">
              Only {product.totalStock} left
            </span>
          )}
        </div>

        {isSoldOut && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-1.5 text-center text-xs font-semibold uppercase tracking-wide text-base-100">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <p className="text-xs text-ink-muted">{product.category.name}</p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink sm:text-base">{product.name}</h3>
        <div className="mt-auto pt-2">
          {isCustom && <p className="text-xs text-ink-muted">Starting from</p>}
          <p
            className={`text-base font-bold tabular-nums sm:text-lg ${isSoldOut ? "text-ink-muted" : "text-accent-text"}`}
          >
            {isCustom ? formatRupiah(product.minPrice) : formatPriceRange(product.minPrice, product.maxPrice)}
          </p>
        </div>
      </div>
    </Link>
  );
}

// placeholder kartu saat data dimuat (bentuk sama dengan kartu asli -> tidak ada layout shift)
export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col overflow-hidden rounded-box border border-base-300 bg-base-100">
      <div className="skeleton aspect-square rounded-none" />
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton mt-2 h-5 w-1/2" />
      </div>
    </div>
  );
}
