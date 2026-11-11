import Link from "next/link";
import { PiArrowLeft } from "react-icons/pi";
import { BrandLogo } from "./brandLogo";

// navbar halaman auth: cukup logo + jalan balik, tanpa menu supaya user fokus ke form
export default function AuthNavbar() {
  return (
    <header className="border-b border-base-300 bg-base-100">
      <div className="navbar mx-auto min-h-16 max-w-7xl px-4 md:px-6">
        <div className="navbar-start">
          <BrandLogo />
        </div>
        <div className="navbar-end">
          <Link href="/" className="btn btn-ghost h-11 gap-2 px-3 text-sm font-medium text-ink hover:text-primary">
            <PiArrowLeft aria-hidden="true" size={18} />
            <span>
              Kembali<span className="hidden sm:inline"> ke Beranda</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
