"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { PiCalendarBlank, PiClock, PiReceipt } from "react-icons/pi";
import { formatCountdown, useCountdown } from "@/features/(costumer)/orders/hooks/useCountdown";
import { formatRupiah } from "@/lib/currency.lib";
import { formatDateWIB } from "@/lib/datetime.lib";
import type { Quotation } from "@/types/customRequest.type";
import { QUOTATION_STATUS } from "../../constants/requestStatus";

function ValidFor({ quotation, serverTime }: { quotation: Quotation; serverTime: string }) {
  const remaining = useCountdown(quotation.validUntil, serverTime);
  return (
    <p className={`flex items-center gap-1.5 text-xs ${remaining < 3 * 3600_000 ? "text-danger-text" : "text-ink-muted"}`}>
      <PiClock aria-hidden="true" size={14} />
      {remaining > 0 ? `Valid for ${formatCountdown(remaining)}` : "This quote has expired"}
    </p>
  );
}

type QuotationCardProps = {
  quotation: Quotation;
  serverTime: string;
  // tombol aksi sesuai peran: pembeli (Accept & pay / Decline) atau admin (Withdraw)
  actions?: ReactNode;
  orderHref?: (code: string) => string;
};

// penawaran: rincian item + add-on, total, tanggal jadi, masa berlaku (PRD §8 no. 3)
export function QuotationCard({ quotation, serverTime, actions, orderHref }: QuotationCardProps) {
  const isActive = quotation.status === "ACTIVE";

  return (
    <section
      aria-label="Quote"
      className={`card border bg-base-100 ${isActive ? "border-primary shadow-md" : "border-base-300"}`}
    >
      <div className="card-body gap-4 p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <PiReceipt aria-hidden="true" size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-ink">Quote</h2>
          </div>
          <span className={`badge badge-sm border-none ${isActive ? "bg-accent-soft text-accent-text" : "bg-surface-sunken text-ink-muted"}`}>
            {QUOTATION_STATUS[quotation.status]}
          </span>
        </header>

        <ul className="flex flex-col gap-2 text-sm">
          {quotation.items.map((item, index) => (
            <li key={`${item.name}-${index}`}>
              <div className="flex justify-between gap-3">
                <span className="text-ink">
                  {item.quantity}× {item.name}
                </span>
                <span className="shrink-0 tabular-nums text-ink">{formatRupiah(item.unitPrice * item.quantity)}</span>
              </div>
              {item.addons.map((addon) => (
                <div key={addon.addonId} className="flex justify-between gap-3 pl-4 text-xs text-ink-muted">
                  <span>
                    + {addon.name} × {addon.quantity}
                    {addon.giftMessage && ` (“${addon.giftMessage}”)`}
                  </span>
                  <span className="shrink-0 tabular-nums">{formatRupiah(addon.unitPrice * addon.quantity)}</span>
                </div>
              ))}
            </li>
          ))}
        </ul>

        <div className="flex items-baseline justify-between gap-3 border-t border-base-300 pt-3">
          <span className="font-semibold text-ink">Total</span>
          <span className="text-xl font-bold tabular-nums text-accent-text">{formatRupiah(quotation.total)}</span>
        </div>
        <p className="-mt-2 text-xs text-ink-muted">Shipping is added when you accept.</p>

        <div className="flex flex-col gap-1.5">
          <p className="flex items-center gap-1.5 text-sm text-ink">
            <PiCalendarBlank aria-hidden="true" size={16} className="text-ink-muted" />
            Ready on {formatDateWIB(quotation.readyDate)}
          </p>
          {isActive && <ValidFor quotation={quotation} serverTime={serverTime} />}
        </div>
        {quotation.notes && <p className="rounded-lg bg-surface-muted p-3 text-sm whitespace-pre-line text-ink">{quotation.notes}</p>}

        {quotation.order && orderHref && (
          <Link href={orderHref(quotation.order.code)} className="btn btn-primary h-11">
            View order {quotation.order.code}
          </Link>
        )}
        {actions}
      </div>
    </section>
  );
}
