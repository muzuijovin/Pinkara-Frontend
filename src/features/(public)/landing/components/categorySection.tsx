"use client";

import Image from "next/image";
import Link from "next/link";
import { PiArrowRight, PiFlowerTulip } from "react-icons/pi";
import { categoryHref, useCategories } from "@/features/categories/hooks/useCategories";
import { categoryImage } from "../constants/categoryImages";

// Kategori (PRD §6.1): kartu kategori dengan foto; klik -> katalog terfilter
export function CategorySection() {
  const { data: categories, isPending, isError } = useCategories();
  if (isError || (!isPending && !categories?.length)) return null;

  return (
    <section aria-labelledby="categories-title" className="mx-auto w-full max-w-7xl px-4 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent-text">Shop by category</p>
          <h2 id="categories-title" className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Find the right flowers for the moment
          </h2>
        </div>
        <Link href="/products" className="flex items-center gap-1 text-sm font-semibold text-accent-text hover:underline">
          View all
          <PiArrowRight aria-hidden="true" size={16} />
        </Link>
      </header>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {isPending &&
          Array.from({ length: 8 }).map((_, index) => (
            <li key={index} className="skeleton aspect-4/5 w-full rounded-[1.25rem]" />
          ))}

        {categories?.map((category) => {
          const image = categoryImage(category.slug, category.imageUrl);
          return (
            <li key={category.id}>
              <Link
                href={categoryHref(category.slug)}
                className="group relative flex aspect-4/5 overflow-hidden rounded-[1.25rem] bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {image ? (
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                ) : (
                  <PiFlowerTulip aria-hidden="true" size={56} className="absolute inset-0 m-auto text-primary/40" />
                )}
                {/* gradasi bawah supaya nama kategori terbaca di atas foto (kartu tanpa foto: teks gelap) */}
                {image && (
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/65 to-transparent" />
                )}
                <span className={`relative mt-auto flex w-full items-end justify-between gap-2 p-4 ${image ? "text-white" : "text-ink"}`}>
                  <span>
                    <span className="block text-base font-semibold sm:text-lg">{category.name}</span>
                    <span className="block text-xs opacity-90">
                      {category._count.products} {category._count.products === 1 ? "product" : "products"}
                    </span>
                  </span>
                  <PiArrowRight aria-hidden="true" size={18} className="mb-0.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          );
        })}

        {/* kartu penutup: jalur custom (7 kategori + 1 kartu ini = grid 4 kolom penuh) */}
        {categories && (
          <li>
            <Link
              href="/custom-order"
              className="group flex aspect-4/5 flex-col justify-between rounded-[1.25rem] border-2 border-dashed border-primary/40 bg-base-100 p-4 transition-colors hover:border-primary hover:bg-accent-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <PiFlowerTulip aria-hidden="true" size={32} className="text-primary" />
              <span>
                <span className="block text-base font-semibold text-ink sm:text-lg">Design your own</span>
                <span className="mt-1 block text-xs text-ink-muted sm:text-sm">Tell us your idea and our florists will make it.</span>
                <span className="mt-3 flex items-center gap-1 text-sm font-semibold text-accent-text">
                  Custom order
                  <PiArrowRight aria-hidden="true" size={16} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
          </li>
        )}
      </ul>
    </section>
  );
}
