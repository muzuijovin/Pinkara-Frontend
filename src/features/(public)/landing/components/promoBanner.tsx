"use client";

import Link from "next/link";
import { PiConfetti } from "react-icons/pi";
import { formatRupiah } from "@/lib/currency.lib";
import type { ActivePromotion } from "@/types/promotion.type";
import { useActivePromotion } from "../hooks/useLanding";

function discountText(promo: ActivePromotion) {
  if (promo.discountType === "FIXED") return `${formatRupiah(promo.value)} off`;
  return `${promo.value}% off${promo.maxDiscount ? ` (up to ${formatRupiah(promo.maxDiscount)})` : ""}`;
}

// banner promo 5 pembeli pertama + sisa kuota real-time, hilang saat kuota habis (PRD §6.1, §10)
export function PromoBanner() {
  const { data: promo } = useActivePromotion();
  if (!promo) return null;

  const taken = promo.quota - promo.remaining;

  return (
    <section aria-labelledby="promo-title" className="mx-auto w-full max-w-7xl px-4 md:px-6">
      <div className="flex flex-col gap-5 rounded-[1.75rem] bg-linear-to-r from-primary to-secondary p-6 text-primary-content shadow-md sm:p-8 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-base-100/20">
            <PiConfetti aria-hidden="true" size={26} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Launch promo</p>
            <h2 id="promo-title" className="text-xl font-bold sm:text-2xl">
              {discountText(promo)} for our first {promo.quota} buyers
            </h2>
            <p className="mt-1 text-sm opacity-90">
              Applied automatically at checkout{promo.appliesTo === "READY" ? " on ready-stock orders" : ""}. One per account.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:w-64">
          {/* sisa kuota: diambil ulang tiap 30 detik */}
          <div>
            <p aria-live="polite" className="text-sm font-semibold">
              {promo.remaining} of {promo.quota} spots left
            </p>
            <div
              role="progressbar"
              aria-label="Promo spots taken"
              aria-valuemin={0}
              aria-valuemax={promo.quota}
              aria-valuenow={taken}
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-base-100/30"
            >
              <div className="h-full rounded-full bg-base-100" style={{ width: `${(taken / promo.quota) * 100}%` }} />
            </div>
          </div>
          <Link href="/products" className="btn h-11 border-none bg-base-100 text-accent-text hover:bg-base-100/90">
            Shop now
          </Link>
        </div>
      </div>
    </section>
  );
}
