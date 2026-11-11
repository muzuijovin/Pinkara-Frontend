import Link from "next/link";
import { PiSealCheck, PiSnowflake } from "react-icons/pi";
import { BrandLogo } from "./brandLogo";

// isi mengikuti footer Figma (1:1785)
const SERVICE_LINKS = [
  { label: "Status & Lacak Pesanan", href: "/orders" },
  { label: "Konsultasi Bespoke Hamper", href: "/custom-order" },
  { label: "Kebijakan Pengembalian", href: "/refund-policy" },
  { label: "Panduan Perawatan Bunga", href: "/flower-care" },
];

const OPENING_HOURS = [
  { day: "Senin - Sabtu", time: "08:00 - 20:00 WIB" },
  { day: "Minggu & Libur", time: "09:00 - 17:00 WIB" },
];

const QUALITY_BADGES = [
  {
    icon: PiSealCheck,
    title: "100% Bunga Segar Pilihan",
    description: "Dipetik dari kebun terakreditasi harian",
  },
  {
    icon: PiSnowflake,
    title: "Pengiriman Same-Day Berpendingin",
    description: "Armada van dengan suhu terkontrol khusus",
  },
];

const LEGAL_LINKS = [
  { label: "Syarat & Ketentuan", href: "/terms" },
  { label: "Privasi Konsumen", href: "/privacy" },
  { label: "Hubungi Kami", href: "/contact" },
];

// footer-title DaisyUI defaultnya uppercase + opacity 60%, dinormalkan supaya kontras teks aman
const titleClass = "footer-title mb-1 text-base font-semibold normal-case text-ink opacity-100";
const linkClass = "link link-hover text-sm text-ink-muted hover:text-primary";

// footer untuk halaman publik & customer
export default function Footer() {
  return (
    <footer className="border-t border-base-300 bg-base-100">
      <div className="footer mx-auto max-w-7xl gap-y-10 px-4 pb-8 pt-12 sm:footer-horizontal md:px-6">
        {/* brand */}
        <aside className="max-w-xs">
          <BrandLogo showTagline={false} />
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Boutique floral studio berstandar artisan internasional di Jakarta. Menghadirkan
            rangkaian bunga segar terkurasi, premium gift hampers, dan instalasi floral mewah untuk
            setiap momen istimewa Anda.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="badge border-none bg-accent-soft text-accent-text">Artisan Florist</span>
            <span className="badge border-none bg-surface-muted text-ink-muted">Est. 2019</span>
          </div>
        </aside>

        {/* layanan pelanggan */}
        <nav aria-label="Layanan pelanggan">
          <h2 className={titleClass}>Layanan Pelanggan</h2>
          {SERVICE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={`${linkClass} py-1`}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* jam operasional */}
        <div className="w-full max-w-xs">
          <h2 className={titleClass}>Jam Operasional Studio</h2>
          <dl className="w-full space-y-3 text-sm">
            {OPENING_HOURS.map((item) => (
              <div key={item.day} className="flex justify-between gap-4">
                <dt className="text-ink-muted">{item.day}</dt>
                <dd className="font-medium tabular-nums text-ink">{item.time}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Pengiriman Kilat</dt>
              <dd className="font-medium text-accent-text">Same-Day Dispatch</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            Pemesanan sebelum pukul 15:00 WIB dikirim pada hari yang sama.
          </p>
        </div>

        {/* standar kualitas */}
        <div className="w-full max-w-xs">
          <h2 className={titleClass}>Standar Kualitas</h2>
          <ul className="w-full space-y-3">
            {QUALITY_BADGES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3 rounded-box bg-surface-muted p-3">
                <Icon aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-ink">{title}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-4 border-t border-base-300 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-ink-muted">
            © 2026 PT Pinkara Floral Studio Indonesia. Hak cipta dilindungi undang-undang.
          </p>
          <nav aria-label="Tautan legal" className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
