import Link from "next/link";
import { PiFlowerTulipFill } from "react-icons/pi";

// logo Pinkara, dipakai di navbar landing, navbar user, navbar auth & footer
export function BrandLogo({ showTagline = true }: { showTagline?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Pinkara Florist Studio, ke beranda"
      className="flex shrink-0 cursor-pointer items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-content"
      >
        <PiFlowerTulipFill size={22} />
      </span>
      <span aria-hidden="true" className="flex flex-col leading-none">
        <span className="text-lg font-bold text-accent-text">Pinkara</span>
        {showTagline && (
          <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
            Florist Studio
          </span>
        )}
      </span>
    </Link>
  );
}
