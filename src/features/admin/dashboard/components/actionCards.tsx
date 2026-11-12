import Link from "next/link";
import type { IconType } from "react-icons";
import { PiArrowCounterClockwise, PiCalendarCheck, PiChatsCircle, PiCheckCircle, PiPackage, PiReceipt, PiTruck } from "react-icons/pi";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import type { DashboardOverview } from "@/types/dashboard.type";

type Card = { label: string; count: number; icon: IconType; href?: string; detail?: string; urgent?: boolean };

// kartu "Perlu tindakan" (PRD §12.2a). Kartu bernilai 0 tampil redup "All clear", tidak disembunyikan,
// supaya tata letak tidak berubah-ubah
export function ActionCards({ actions }: { actions: DashboardOverview["actions"] }) {
  const cards: Card[] = [
    {
      label: "Paid orders to process",
      count: actions.toProcess.count,
      icon: PiPackage,
      href: "/admin/orders?status=DIBAYAR",
      detail: actions.toProcess.oldest ? `Oldest paid ${formatDateTimeWIB(actions.toProcess.oldest.paidAt)}` : undefined,
    },
    { label: "Need a tracking number", count: actions.needTracking, icon: PiTruck, href: "/admin/orders?status=DIKEMAS" },
    {
      label: "Custom chats awaiting reply",
      count: actions.customAwaitingReply.count,
      icon: PiChatsCircle,
      href: "/admin/custom-requests",
      detail: actions.customAwaitingReply.overdue ? `${actions.customAwaitingReply.overdue} waiting over 12 hours` : undefined,
      urgent: actions.customAwaitingReply.overdue > 0,
    },
    { label: "Custom orders due within 2 days", count: actions.customNearDeadline, icon: PiCalendarCheck, href: "/admin/orders?status=DIPRODUKSI" },
    { label: "Refunds to send", count: actions.refunds, icon: PiArrowCounterClockwise, href: "/admin/orders?status=PERLU_REFUND", urgent: actions.refunds > 0 },
    { label: "Transfers to verify", count: actions.manualVerification, icon: PiReceipt },
  ];

  return (
    <section aria-labelledby="actions-title">
      <h2 id="actions-title" className="text-lg font-semibold text-ink">
        Needs your attention
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, count, icon: Icon, href, detail, urgent }) => {
          const idle = count === 0;
          const body = (
            <>
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
                  idle ? "bg-surface-sunken text-ink-muted" : urgent ? "bg-danger-soft text-danger-text" : "bg-accent-soft text-accent-text"
                }`}
              >
                {idle ? <PiCheckCircle aria-hidden="true" size={22} /> : <Icon aria-hidden="true" size={22} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm ${idle ? "text-ink-muted" : "font-medium text-ink"}`}>{label}</span>
                {idle ? (
                  <span className="block text-xs text-ink-muted">All clear</span>
                ) : (
                  detail && <span className={`block text-xs ${urgent ? "font-medium text-danger-text" : "text-ink-muted"}`}>{detail}</span>
                )}
              </span>
              <span className={`text-2xl font-bold tabular-nums ${idle ? "text-ink-muted" : urgent ? "text-danger-text" : "text-ink"}`}>{count}</span>
            </>
          );
          const className = `flex items-center gap-3 rounded-box border p-4 ${
            idle ? "border-base-300 bg-base-100 opacity-70" : urgent ? "border-danger-text/40 bg-base-100" : "border-base-300 bg-base-100"
          }`;
          return (
            <li key={label}>
              {href && !idle ? (
                <Link href={href} className={`${className} transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}>
                  {body}
                </Link>
              ) : (
                <div className={className}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
