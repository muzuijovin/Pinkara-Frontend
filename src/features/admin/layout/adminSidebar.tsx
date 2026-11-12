"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import {
  PiChatsCircle,
  PiClipboardText,
  PiCreditCard,
  PiFlowerTulip,
  PiGauge,
  PiGift,
  PiImages,
  PiReceipt,
  PiSquaresFour,
  PiUser,
} from "react-icons/pi";

type NavItem = { label: string; href: string; icon: IconType; ready: boolean };

// menu panel admin (PRD §12). ready = halaman sudah dibuat; yang belum tampil "Soon" & tidak bisa diklik
const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Store",
    items: [
      { label: "Dashboard", href: "/admin", icon: PiGauge, ready: false },
      { label: "Orders", href: "/admin/orders", icon: PiReceipt, ready: true },
      { label: "Custom requests", href: "/admin/custom-requests", icon: PiChatsCircle, ready: true },
      { label: "Payments", href: "/admin/payments", icon: PiCreditCard, ready: false },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Products", href: "/admin/products", icon: PiFlowerTulip, ready: true },
      { label: "Categories", href: "/admin/categories", icon: PiSquaresFour, ready: false },
      { label: "Add-ons", href: "/admin/addons", icon: PiGift, ready: false },
      { label: "Gallery", href: "/admin/gallery", icon: PiImages, ready: false },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Audit log", href: "/admin/audit-logs", icon: PiClipboardText, ready: false },
      { label: "My profile", href: "/profile", icon: PiUser, ready: true },
    ],
  },
];

// /admin hanya aktif di halaman dashboard itu sendiri; menu lain aktif juga di sub-halamannya
const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

const ALL_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

function NavLink({ item, pathname, compact = false }: { item: NavItem; pathname: string; compact?: boolean }) {
  const { label, href, icon: Icon, ready } = item;
  const active = isActive(pathname, href);
  const base = compact
    ? "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm"
    : "flex h-11 items-center gap-3 rounded-lg px-3 text-[15px]";

  if (!ready) {
    return (
      <span aria-disabled="true" className={`${base} cursor-not-allowed text-ink-muted/70`}>
        <Icon aria-hidden="true" size={compact ? 18 : 20} />
        <span className="flex-1">{label}</span>
        <span className="rounded-full bg-surface-sunken px-1.5 text-[10px] font-semibold uppercase tracking-wide">Soon</span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${base} transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        active ? "bg-accent-soft font-semibold text-accent-text" : "text-ink hover:bg-surface-muted"
      }`}
    >
      <Icon aria-hidden="true" size={compact ? 18 : 20} />
      {label}
    </Link>
  );
}

// navigasi panel admin: sidebar kiri di desktop (lg ke atas), deretan tab yang bisa digeser di HP/tablet
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside aria-label="Admin navigation" className="hidden w-68 shrink-0 border-r border-base-300 bg-base-100 lg:block">
        <nav className="sticky top-16 flex max-h-[calc(100vh-4rem)] flex-col gap-6 overflow-y-auto px-4 py-7">
          <p className="px-3 text-sm font-semibold uppercase tracking-wide text-accent-text">Admin panel</p>
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">{group.title}</p>
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* HP & tablet: hanya menu yang sudah jadi, digeser ke samping */}
      <nav aria-label="Admin navigation" className="border-b border-base-300 bg-base-100 lg:hidden">
        <div className="flex gap-1 overflow-x-auto px-4 py-2 scrollbar-none">
          {ALL_ITEMS.filter((item) => item.ready).map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} compact />
          ))}
        </div>
      </nav>
    </>
  );
}
