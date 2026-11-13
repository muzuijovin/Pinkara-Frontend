import Link from "next/link";

// logo Pinkara, dipakai di navbar landing, navbar user, navbar auth & footer.
// Pakai versi kecil khusus (public/pinkara-mark-56/112/168.png): dipotong tepat di tepi cincin pink
// (permintaan pemilik toko: cincin pink harus terlihat), sudah diperkecil
// + dipertajam per ukuran layar (1x/2x/3x). Logo penuh resolusi tinggi ada di public/pinkara-logo.png
// tone "light" = di atas latar gelap (footer hijau): nama pink muda supaya kontras tetap terbaca
export function BrandLogo({ showTagline = true, tone = "default" }: { showTagline?: boolean; tone?: "default" | "light" }) {
  return (
    <Link
      href="/"
      aria-label="Pinkara Studio, go to homepage"
      className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 ${tone === "light" ? "focus-visible:outline-on-footer-accent" : "focus-visible:outline-primary"}`}
    >
      {/* <img> biasa (bukan next/image) supaya srcSet 1x/2x/3x hasil resize sendiri dipakai apa adanya */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/pinkara-mark-112.png"
        srcSet="/pinkara-mark-56.png 1x, /pinkara-mark-112.png 2x, /pinkara-mark-168.png 3x"
        alt=""
        width={56}
        height={56}
        fetchPriority="high"
        className="size-14 shrink-0 rounded-full"
      />
      <span aria-hidden="true" className="flex flex-col">
        <span className={`text-xl font-bold leading-6 ${tone === "light" ? "text-on-footer-accent" : "text-accent-text"}`}>Pinkara</span>
        {showTagline && (
          <span className={`text-[10px] font-semibold uppercase leading-3 tracking-[0.3em] ${tone === "light" ? "text-on-footer-muted" : "text-ink-muted"}`}>
            Studio
          </span>
        )}
      </span>
    </Link>
  );
}
