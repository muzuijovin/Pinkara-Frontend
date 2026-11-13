import Image from "next/image";
import Link from "next/link";
import type { IconType } from "react-icons";
import { PiEnvelopeSimple, PiInstagramLogo, PiMapPin, PiWhatsappLogo } from "react-icons/pi";
import { type BrandLogo as Brand, emailUrl, instagramUrl, PAYMENT_METHODS, SHIPPING_PARTNERS, SITE, whatsappDisplay, whatsappUrl } from "@/config/site";
import { BrandLogo } from "./brandLogo";

const LINK_GROUPS = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/products" },
      { label: "Custom order", href: "/custom-order" },
      { label: "Track your order", href: "/orders" },
      { label: "Flower care guide", href: "/blog/flower-care-guide" },
    ],
  },
  {
    title: "Pinkara",
    links: [
      { label: "About us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Privacy policy", href: "/privacy" },
    ],
  },
];

const SOCIALS: { label: string; href: string; icon: IconType; external: boolean }[] = [
  { label: "Instagram", href: instagramUrl, icon: PiInstagramLogo, external: true },
  { label: "WhatsApp", href: whatsappUrl, icon: PiWhatsappLogo, external: true },
  { label: "Email", href: emailUrl, icon: PiEnvelopeSimple, external: false },
];

// footer berlatar hijau logo: teks terang + aksen pink. Ring fokus pink muda (pink primary terlalu gelap di atas hijau)
const titleClass = "mb-3 text-base font-semibold text-on-footer";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-footer-accent";
const linkClass = `text-sm text-on-footer-muted transition-colors duration-200 hover:text-on-footer-accent focus-visible:rounded ${focusRing}`;

// logo metode bayar & kurir di kotak putih (logo SVG dipakai apa adanya -> unoptimized)
function Logos({ label, items }: { label: string; items: Brand[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-on-footer-muted">{label}</h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.name} title={item.name} className="flex h-9 items-center rounded-md bg-white px-2.5 shadow-sm">
            <Image src={item.src} alt={item.name} width={item.width} height={item.height} unoptimized className="h-5 w-auto" />
          </li>
        ))}
      </ul>
    </div>
  );
}

// footer halaman publik & customer: brand + sosial media, menu, kontak & jam buka, metode bayar & kurir, legal.
// Data kontak diambil dari src/config/site.ts
export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-footer text-on-footer-muted">
      {/* garis pink tipis di atas (cincin logo) + cahaya lembut di pojok sebagai hiasan */}
      <div aria-hidden="true" className="h-1 bg-linear-to-r from-pink-brand-300 via-pink-brand-200 to-pink-brand-300" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-40 size-96 rounded-full bg-green-brand-500/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-32 size-96 rounded-full bg-pink-brand-400/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pt-12 pb-10 sm:grid-cols-2 md:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        {/* brand & sosial media */}
        <div className="flex flex-col gap-4">
          <BrandLogo showTagline={false} tone="light" />
          <p className="max-w-xs text-sm leading-relaxed">
            A floral studio in {SITE.city}. Ready-made bouquets and custom pieces, arranged by hand and delivered across Indonesia.
          </p>
          <ul aria-label="Follow and contact us" className="flex gap-2">
            {SOCIALS.map(({ label, href, icon: Icon, external }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label={external ? `${label} (opens in a new tab)` : label}
                  className={`flex size-11 items-center justify-center rounded-full bg-white/10 text-on-footer ring-1 ring-white/15 transition-colors duration-200 hover:bg-on-footer-accent hover:text-green-brand-900 ${focusRing}`}
                >
                  <Icon aria-hidden="true" size={22} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* menu */}
        {LINK_GROUPS.map((group) => (
          <nav key={group.title} aria-labelledby={`footer-${group.title}`}>
            <h2 id={`footer-${group.title}`} className={titleClass}>
              {group.title}
            </h2>
            <ul className="flex flex-col gap-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* kontak & jam buka */}
        <div>
          <h2 className={titleClass}>Visit & contact</h2>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li className="flex items-start gap-2">
              <PiMapPin aria-hidden="true" size={18} className="mt-px shrink-0 text-on-footer-accent" />
              {SITE.address}
            </li>
            <li>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${linkClass} flex items-center gap-2`}>
                <PiWhatsappLogo aria-hidden="true" size={18} className="shrink-0 text-on-footer-accent" />
                {whatsappDisplay}
                <span className="sr-only">(WhatsApp, opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={emailUrl} className={`${linkClass} flex items-center gap-2 wrap-anywhere`}>
                <PiEnvelopeSimple aria-hidden="true" size={18} className="shrink-0 text-on-footer-accent" />
                {SITE.email}
              </a>
            </li>
          </ul>
          <dl className="mt-4 flex flex-col gap-1.5 rounded-box bg-white/5 p-3 text-sm ring-1 ring-white/10">
            {SITE.hours.map((item) => (
              <div key={item.day} className="flex justify-between gap-4">
                <dt>{item.day}</dt>
                <dd className="font-medium tabular-nums text-on-footer">{item.time} WIB</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* metode bayar & kurir */}
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-6 border-t border-footer-line py-6 sm:flex-row sm:gap-12">
          <Logos label="Payment methods" items={PAYMENT_METHODS} />
          <Logos label="Shipping partners" items={SHIPPING_PARTNERS} />
        </div>
      </div>

      {/* legal */}
      <div className="relative bg-footer-deep">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p>
            {/* tahun ditulis tetap: new Date() di server component memicu error prerender (cacheComponents) */}
            © 2026 {SITE.name}, {SITE.city}. All rights reserved.
          </p>
          <Link href="/privacy" className={linkClass}>
            Privacy policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
