"use client";

import { BrandLogo } from "@/components/layout/brandLogo";
import { VerifyEmailBanner } from "@/features/auth/components/verifyEmailBanner";
import type { User } from "@/types/auth.type";
import { AccountMenu } from "./components/accountMenu";
import { CartLink } from "./components/cartLink";
import { DesktopNav } from "./components/desktopNav";
import { MobileMenu } from "./components/mobileMenu";
import { SearchBar } from "./components/searchBar";

// navbar setelah login, mengikuti header Figma (1:1866).
// Admin: tanpa keranjang & menu "Custom Order" diganti "Admin panel"
export function NavbarUser({ user }: { user: User }) {
  return (
    <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100">
      <div className="navbar mx-auto min-h-16 max-w-7xl gap-3 px-4 md:px-6 lg:gap-6">
        <div className="navbar-start w-auto gap-1">
          <MobileMenu role={user.role} />
          <BrandLogo />
        </div>

        <SearchBar className="hidden max-w-xs flex-1 md:block" />

        <div className="navbar-end ml-auto w-auto gap-1 lg:gap-4">
          <DesktopNav role={user.role} />
          <div aria-hidden="true" className="divider divider-horizontal mx-0 hidden h-6 self-center lg:flex" />
          {user.role === "CUSTOMER" && <CartLink />}
          <AccountMenu user={user} />
        </div>
      </div>

      {!user.emailVerifiedAt && <VerifyEmailBanner />}
    </header>
  );
}
