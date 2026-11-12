"use client";

import Image from "next/image";
import { useRef, useState, type UIEvent } from "react";
import { PiImageSquare, PiMagnifyingGlassPlus, PiX } from "react-icons/pi";

// galeri foto (PRD §6.3): geser di HP (scroll-snap), thumbnail untuk lompat ke foto, klik foto = perbesar
export function ProductGallery({ images, name, badge }: { images: string[]; name: string; badge?: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);

  // foto aktif mengikuti posisi geser
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index !== active) setActive(index);
  };

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
    setActive(index);
  };

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-box bg-surface-muted text-ink-muted">
        <PiImageSquare aria-hidden="true" size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-box bg-surface-muted">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carousel"
          aria-label={`${name} photos`}
        >
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => zoomRef.current?.showModal()}
              aria-label={`Enlarge photo ${index + 1} of ${images.length}`}
              className="relative aspect-square w-full shrink-0 snap-center cursor-zoom-in"
            >
              <Image
                src={src}
                alt={index === 0 ? name : `${name}, photo ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {badge && <div className="pointer-events-none absolute left-3 top-3">{badge}</div>}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-base-100/90 text-ink shadow-sm"
        >
          <PiMagnifyingGlassPlus size={18} />
        </span>
        {images.length > 1 && (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium tabular-nums text-base-100 sm:hidden">
            {active + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={active === index ? "true" : undefined}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                active === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* perbesar foto: <dialog> bawaan -> Esc / klik luar menutup */}
      <dialog ref={zoomRef} aria-label={`${name}, enlarged photo`} className="modal">
        <div className="modal-box max-w-3xl p-2">
          <form method="dialog" className="absolute right-3 top-3 z-10">
            <button aria-label="Close" className="btn btn-circle btn-sm size-10 bg-base-100/90">
              <PiX aria-hidden="true" size={18} />
            </button>
          </form>
          <div className="relative aspect-square w-full overflow-hidden rounded-box">
            <Image src={images[active]} alt={name} fill sizes="(min-width: 768px) 768px, 100vw" className="object-contain" />
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close">close</button>
        </form>
      </dialog>
    </div>
  );
}
