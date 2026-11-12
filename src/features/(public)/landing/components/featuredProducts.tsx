"use client";

import Link from "next/link";
import { PiArrowRight } from "react-icons/pi";
import { ProductCard, ProductCardSkeleton } from "@/components/product/productCard";
import { useFeaturedProducts } from "../hooks/useLanding";

// Produk unggulan (PRD §6.1): 4–8 produk ready stock bertanda featured, label "Out of stock" bila stok 0
export function FeaturedProducts() {
  const { data, isPending, isError } = useFeaturedProducts();
  if (isError || (!isPending && !data?.products.length)) return null;

  // tampilkan kelipatan 4 supaya baris grid desktop tidak bolong (8, atau 4 kalau produknya 4–7)
  const all = data?.products ?? [];
  const products = all.length >= 8 ? all.slice(0, 8) : all.length >= 4 ? all.slice(0, 4) : all;

  return (
    <section aria-labelledby="featured-title" className="mx-auto w-full max-w-7xl px-4 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent-text">
            {data?.isFallback ? "Just arrived" : "Featured"}
          </p>
          <h2 id="featured-title" className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {data?.isFallback ? "New in the studio" : "Our customers' favorites"}
          </h2>
        </div>
        <Link href="/products" className="flex items-center gap-1 text-sm font-semibold text-accent-text hover:underline">
          Shop all flowers
          <PiArrowRight aria-hidden="true" size={16} />
        </Link>
      </header>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {isPending &&
          Array.from({ length: 4 }).map((_, index) => (
            <li key={index}>
              <ProductCardSkeleton />
            </li>
          ))}
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
