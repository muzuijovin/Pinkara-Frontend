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

const titleClass = "mb-3 text-base font-semibold text-ink";
const linkClass =
  "text-sm text-ink-muted transition-colors duration-200 hover:text-accent-text focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

// logo metode bayar & kurir di kotak putih (logo SVG dipakai apa adanya -> unoptimized)
function Logos({ label, items }: { label: string; items: Brand[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.name} title={item.name} className="flex h-9 items-center rounded-md border border-base-300 bg-white px-2.5">
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
    <footer className="border-t border-base-300 bg-base-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-12 pb-10 sm:grid-cols-2 md:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        {/* brand & sosial media */}
        <div className="flex flex-col gap-4">
          <BrandLogo showTagline={false} />
          <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
            A floral studio in {SITE.city}. Ready-made bouquets and custom pieces, arranged by hand and delivered across Indonesia.
          </p>
          <ul aria-label="Follow and contact us" className="flex gap-2">
            {SOCIALS.map(({ label, href, icon: Icon, external }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label={external ? `${label} (opens in a new tab)` : label}
                  className="flex size-11 items-center justify-center rounded-full bg-surface-muted text-ink transition-colors duration-200 hover:bg-accent-soft hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
            <li className="flex items-start gap-2 text-ink-muted">
              <PiMapPin aria-hidden="true" size={18} className="mt-px shrink-0 text-primary" />
              {SITE.address}
            </li>
            <li>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${linkClass} flex items-center gap-2`}>
                <PiWhatsappLogo aria-hidden="true" size={18} className="shrink-0 text-primary" />
                {whatsappDisplay}
                <span className="sr-only">(WhatsApp, opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={emailUrl} className={`${linkClass} flex items-center gap-2 wrap-anywhere`}>
                <PiEnvelopeSimple aria-hidden="true" size={18} className="shrink-0 text-primary" />
                {SITE.email}
              </a>
            </li>
          </ul>
          <dl className="mt-4 flex flex-col gap-1.5 text-sm">
            {SITE.hours.map((item) => (
              <div key={item.day} className="flex justify-between gap-4">
                <dt className="text-ink-muted">{item.day}</dt>
                <dd className="font-medium tabular-nums text-ink">{item.time} WIB</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* metode bayar & kurir */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-6 border-t border-base-300 py-6 sm:flex-row sm:gap-12">
          <Logos label="Payment methods" items={PAYMENT_METHODS} />
          <Logos label="Shipping partners" items={SHIPPING_PARTNERS} />
        </div>
      </div>

      {/* legal */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-3 border-t border-base-300 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
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
