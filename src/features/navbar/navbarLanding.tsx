"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/layout/brandLogo";
import { CartLink } from "./components/cartLink";
import { DesktopNav } from "./components/desktopNav";
import { MobileMenu } from "./components/mobileMenu";
import { SearchBar } from "./components/searchBar";

// navbar untuk tamu (belum login), mengikuti header Figma (1:1866)
export function NavbarLanding() {
  return (
    <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100">
      <div className="navbar mx-auto min-h-16 max-w-7xl gap-3 px-4 md:px-6 lg:gap-6">
        <div className="navbar-start w-auto gap-1">
          <MobileMenu>
            {/* tombol akun versi HP, di sm ke atas sudah tampil di header */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <Link href="/login" className="btn btn-outline btn-primary h-11">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary h-11">
                Sign up
              </Link>
            </div>
          </MobileMenu>
          <BrandLogo />
        </div>

        <SearchBar className="hidden max-w-xs flex-1 md:block" />

        <div className="navbar-end ml-auto w-auto gap-2 lg:gap-4">
          <DesktopNav />
          <div aria-hidden="true" className="divider divider-horizontal mx-0 hidden h-6 self-center lg:flex" />
          <CartLink />
          <Link href="/login" className="btn btn-ghost hidden h-11 px-4 text-[15px] text-ink sm:inline-flex">
            Log in
          </Link>
          <Link href="/register" className="btn btn-primary hidden h-11 px-5 text-[15px] sm:inline-flex">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
