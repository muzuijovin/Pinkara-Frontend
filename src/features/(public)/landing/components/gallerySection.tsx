"use client";

import Image from "next/image";
import { useGallery } from "../hooks/useLanding";

// galeri hasil karya (dikelola admin) (PRD §6.1). Belum ada foto -> section disembunyikan
export function GallerySection() {
  const { data: items } = useGallery();
  if (!items?.length) return null;

  return (
    <section aria-labelledby="gallery-title" className="mx-auto w-full max-w-7xl px-4 md:px-6">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent-text">Our work</p>
        <h2 id="gallery-title" className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Made with love in our studio
        </h2>
      </header>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {items.slice(0, 8).map((item, index) => (
          <li
            key={item.id}
            className={`relative overflow-hidden rounded-[1.25rem] bg-surface-muted ${index % 5 === 0 ? "row-span-2 aspect-4/5 md:aspect-auto" : "aspect-square"}`}
          >
            <Image
              src={item.imageUrl}
              alt={item.caption ?? "Flower arrangement made by Pinkara Studio"}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
            />
            {item.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-3 pt-8 text-xs text-white">
                {item.caption}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
