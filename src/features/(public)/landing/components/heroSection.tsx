import Image from "next/image";
import Link from "next/link";
import { PiArrowRight, PiFlowerLotus, PiGift, PiShieldCheck } from "react-icons/pi";

const HIGHLIGHTS = [
  { icon: PiFlowerLotus, label: "Hand-arranged by our florists" },
  { icon: PiGift, label: "Gift card & packaging add-ons" },
  { icon: PiShieldCheck, label: "Secure QRIS & bank payment" },
];

// Hero (PRD §6.1): foto produk, headline singkat, 2 CTA "Lihat Katalog" & "Pesan Custom"
export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-page">
      {/* lingkaran dekoratif lembut di belakang foto */}
      <div aria-hidden="true" className="absolute -right-24 -top-24 size-112 rounded-full bg-accent-soft/60 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:px-6 md:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-16 lg:pb-8">
        <div className="flex flex-col gap-6">
          <p className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-text">
            Pinkara Studio · Florist
          </p>
          <h1 id="hero-title" className="text-4xl leading-[1.1] font-bold tracking-tight text-balance text-ink sm:text-5xl lg:text-6xl">
            Flowers that say it <span className="text-primary">for you</span>
          </h1>
          <p className="max-w-[46ch] text-base leading-relaxed text-ink-muted sm:text-lg">
            Hand-arranged bouquets, bloom boxes, and keepsakes for every moment. Pick one that&apos;s ready to send, or
            design your own with our florists.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className="btn btn-primary h-12 gap-2 px-6 text-[15px]">
              Browse catalog
              <PiArrowRight aria-hidden="true" size={18} />
            </Link>
            <Link href="/custom-order" className="btn btn-outline btn-primary h-12 px-6 text-[15px]">
              Custom order
            </Link>
          </div>

          <ul className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-ink">
                <Icon aria-hidden="true" size={18} className="shrink-0 text-primary" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* kolase foto: 1 besar + 2 kecil (desktop di kanan, HP di bawah teks) */}
        <div className="grid grid-cols-[1.4fr_1fr] gap-3 sm:gap-4">
          {/* tinggi foto besar = 2 foto kecil + jarak, jadi tepi bawah kolase selalu rata */}
          <div className="relative row-span-2 overflow-hidden rounded-4xl shadow-lg">
            <Image
              src="/images/categories/round-bouquet.webp"
              alt="Round bouquet of pink roses wrapped in white paper"
              fill
              priority
              sizes="(min-width: 1024px) 30vw, 58vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl shadow-md">
            <Image
              src="/images/categories/hand-bouquet.webp"
              alt="Pink tulips wrapped in brown paper"
              fill
              sizes="(min-width: 1024px) 20vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl shadow-md">
            <Image
              src="/images/categories/mini-museum.webp"
              alt="A rose preserved inside a glass dome"
              fill
              sizes="(min-width: 1024px) 20vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
