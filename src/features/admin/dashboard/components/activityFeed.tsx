import Link from "next/link";
import type { IconType } from "react-icons";
import { PiChatsCircle, PiClockCountdown, PiCreditCard, PiPencilSimple, PiReceipt, PiWarning } from "react-icons/pi";
import { formatRupiah } from "@/lib/currency.lib";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import type { DashboardActivity } from "@/types/dashboard.type";

const ENTITY_LABEL: Record<string, string> = { product: "a product", addon: "an add-on", category: "a category" };
const ACTION_LABEL: Record<string, string> = { create: "added", update: "updated", delete: "deleted", stock_adjust: "adjusted stock for" };

// kalimat, ikon, dan tujuan link untuk tiap jenis kejadian
function describe(event: DashboardActivity): { icon: IconType; text: string; href?: string } {
  switch (event.kind) {
    case "order_placed":
      return { icon: PiReceipt, text: `${event.actorName} placed order ${event.orderCode}${event.amount ? ` · ${formatRupiah(event.amount)}` : ""}`, href: `/admin/orders/${event.orderCode}` };
    case "payment_received":
      return { icon: PiCreditCard, text: `Payment received for ${event.orderCode}`, href: `/admin/orders/${event.orderCode}` };
    case "order_expired":
      return { icon: PiClockCountdown, text: `Order ${event.orderCode} expired without payment`, href: `/admin/orders/${event.orderCode}` };
    case "refund_needed":
      return { icon: PiWarning, text: `Order ${event.orderCode} needs a refund`, href: `/admin/orders/${event.orderCode}` };
    case "custom_message":
      return { icon: PiChatsCircle, text: `New message from ${event.actorName}`, href: `/admin/custom-requests/${event.requestCode}` };
    default:
      return { icon: PiPencilSimple, text: `${event.actorName} ${ACTION_LABEL[event.action ?? ""] ?? "changed"} ${ENTITY_LABEL[event.entity ?? ""] ?? "the catalog"}` };
  }
}

// 10 kejadian terakhir (PRD §12.2d)
export function ActivityFeed({ activity }: { activity: DashboardActivity[] }) {
  return (
    <section aria-labelledby="activity-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-3 p-4 sm:p-5">
        <h2 id="activity-title" className="font-semibold text-ink">
          Recent activity
        </h2>
        {activity.length === 0 ? (
          <p className="text-sm text-ink-muted">Nothing has happened yet.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {activity.map((event, index) => {
              const { icon: Icon, text, href } = describe(event);
              const content = (
                <>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
                    <Icon aria-hidden="true" size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-ink wrap-break-word">{text}</span>
                    <span className="block text-xs text-ink-muted">{formatDateTimeWIB(event.createdAt)}</span>
                  </span>
                </>
              );
              return (
                <li key={`${event.kind}-${event.createdAt}-${index}`}>
                  {href ? (
                    <Link href={href} className="flex gap-3 rounded-lg hover:bg-surface-muted/60">
                      {content}
                    </Link>
                  ) : (
                    <div className="flex gap-3">{content}</div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
