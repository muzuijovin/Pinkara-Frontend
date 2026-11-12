"use client";

import Link from "next/link";
import { PiShoppingCartSimple } from "react-icons/pi";
import { useCart } from "@/features/(costumer)/cart/hooks/useCart";

// ikon keranjang (PRD §6.1: tampil untuk tamu & customer) + badge jumlah unit dari GET /cart.
// Tamu (guest): tanpa badge & tanpa GET /cart, langsung ke /login lalu kembali ke /cart setelah login
export function CartLink({ guest = false }: { guest?: boolean }) {
  if (guest) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent("/cart")}`}
        aria-label="Cart (log in to view)"
        className="btn btn-ghost btn-square size-11 text-ink"
      >
        <PiShoppingCartSimple aria-hidden="true" size={22} />
      </Link>
    );
  }
  return <CustomerCartLink />;
}

function CustomerCartLink() {
  const { data: cart } = useCart();
  const count = cart?.summary.itemCount ?? 0;

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"}
      className="btn btn-ghost btn-square relative size-11 text-ink"
    >
      <PiShoppingCartSimple aria-hidden="true" size={22} />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-5 text-primary-content ring-2 ring-base-100"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
