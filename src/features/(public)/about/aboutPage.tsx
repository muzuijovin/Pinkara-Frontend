import Image from "next/image";
import Link from "next/link";
import { PiArrowRight, PiChatsCircle, PiFlowerTulip, PiInstagramLogo, PiTruck, PiWhatsappLogo } from "react-icons/pi";
import { instagramUrl, SITE, whatsappUrl } from "@/config/site";

const MAKES = [
  { name: "Round bouquets", image: "/images/categories/round-bouquet.webp" },
  { name: "Bloom boxes", image: "/images/categories/bloom-box.webp" },
  { name: "Flower frames", image: "/images/categories/flower-frame.webp" },
  { name: "Mini museums", image: "/images/categories/mini-museum.webp" },
];

const PROMISES = [
  { icon: PiFlowerTulip, title: "Arranged by hand", text: "Every piece is made in our studio by our own florists." },
  { icon: PiChatsCircle, title: "Made the way you want", text: "Send a custom brief and chat with us until it's just right." },
  { icon: PiTruck, title: "Delivered across Indonesia", text: "Same-day couriers around Malang, regular shipping everywhere else." },
];

// Tentang Pinkara (menu navbar PRD §6.1, link footer "About us"). Isi umum tanpa klaim yang belum pasti
export function AboutPage() {
  return (
    <div className="flex flex-col gap-16 pb-16 md:gap-20">
      <section className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 pt-10 md:px-6 md:pt-14 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <p className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-text">About us</p>
          <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-balance text-ink sm:text-5xl">Flowers made with care, from Malang</h1>
          <p className="max-w-[52ch] text-base leading-relaxed text-ink-muted sm:text-lg">
            {SITE.name} is a floral studio in {SITE.city}. We make fresh bouquets, gift boxes, and keepsakes that hold on to a moment, whether
            it&apos;s a birthday, a graduation, or a simple thank-you.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className="btn btn-primary h-12 gap-2 px-6 text-[15px]">
              Shop flowers
              <PiArrowRight aria-hidden="true" size={18} />
            </Link>
            <Link href="/custom-order" className="btn btn-outline btn-primary h-12 px-6 text-[15px]">
              Start a custom order
            </Link>
          </div>
        </div>
        <div className="relative aspect-4/3 overflow-hidden rounded-4xl shadow-lg">
          <Image src="/images/categories/hand-bouquet.webp" alt="A hand-tied bouquet made in our studio" fill priority sizes="(min-width: 1024px) 45vw, 92vw" className="object-cover" />
        </div>
      </section>

      <section aria-labelledby="promise-title" className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <h2 id="promise-title" className="mb-6 text-2xl font-bold tracking-tight text-ink">
          What we care about
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4 rounded-box border border-base-300 bg-base-100 p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                <Icon aria-hidden="true" size={22} />
              </span>
              <div>
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="makes-title" className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="makes-title" className="text-2xl font-bold tracking-tight text-ink">
            What we make
          </h2>
          <Link href="/products" className="text-sm font-medium text-accent-text underline-offset-2 hover:underline">
            See all products
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {MAKES.map((item) => (
            <li key={item.name} className="flex flex-col gap-2">
              <div className="relative aspect-square overflow-hidden rounded-box bg-surface-muted">
                <Image src={item.image} alt="" fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover" />
              </div>
              <p className="text-sm font-medium text-ink">{item.name}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="visit-title" className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-5 rounded-4xl bg-accent-soft/50 p-6 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="flex flex-col gap-2">
            <h2 id="visit-title" className="text-2xl font-bold tracking-tight text-ink">
              Say hello
            </h2>
            <p className="max-w-[48ch] text-ink-muted">
              Questions about an order, or an idea for a custom piece? Message us, or pick up your order at our studio in {SITE.city}.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary h-12 gap-2 px-5">
              <PiWhatsappLogo aria-hidden="true" size={20} />
              Chat on WhatsApp
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-primary h-12 gap-2 px-5">
              <PiInstagramLogo aria-hidden="true" size={20} />
              Instagram
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
