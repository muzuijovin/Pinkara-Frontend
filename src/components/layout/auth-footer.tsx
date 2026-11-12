import Link from "next/link";

const LEGAL_LINKS = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Contact Us", href: "/contact" },
];

// footer ringkas untuk halaman auth
export default function AuthFooter() {
  return (
    <footer className="border-t border-base-300 bg-base-100">
      <div className="footer mx-auto max-w-7xl gap-3 px-4 py-5 text-sm text-ink-muted md:footer-horizontal md:items-center md:justify-between md:px-6">
        <p>© 2026 PT Pinkara Floral Studio Indonesia.</p>
        <nav aria-label="Legal links" className="flex flex-wrap gap-x-6 gap-y-2">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="link link-hover hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
