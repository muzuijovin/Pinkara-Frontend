import Link from "next/link";

// logo Pinkara, dipakai di navbar landing, navbar user, navbar auth & footer.
// Pakai versi kecil khusus (public/pinkara-mark-*.png): dipotong ke area tulisan & sudah diperkecil
// + dipertajam per ukuran layar (1x/2x/3x). Logo penuh resolusi tinggi ada di public/pinkara-logo.png
export function BrandLogo({ showTagline = true }: { showTagline?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Pinkara Studio, go to homepage"
      className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      {/* <img> biasa (bukan next/image) supaya srcSet 1x/2x/3x hasil resize sendiri dipakai apa adanya */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/pinkara-mark-96.png"
        srcSet="/pinkara-mark-48.png 1x, /pinkara-mark-96.png 2x, /pinkara-mark-144.png 3x"
        alt=""
        width={48}
        height={48}
        fetchPriority="high"
        className="size-12 shrink-0 rounded-full"
      />
      <span aria-hidden="true" className="flex flex-col">
        <span className="text-xl font-bold leading-6 text-accent-text">Pinkara</span>
        {showTagline && (
          <span className="text-[10px] font-semibold uppercase leading-3 tracking-[0.3em] text-ink-muted">
            Studio
          </span>
        )}
      </span>
    </Link>
  );
}
