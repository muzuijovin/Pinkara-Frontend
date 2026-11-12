"use client";

import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import type { IconType } from "react-icons";
import { PiBell, PiChatCircleText, PiChatsCircle, PiChecks, PiFlowerTulip, PiPackage, PiReceipt, PiTag } from "react-icons/pi";
import { useDropdown } from "@/features/navbar/hooks/useDropdown";
import { formatRelativeTime } from "@/lib/datetime.lib";
import type { AppNotification, NotificationType } from "@/types/notification.type";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotificationList, useUnreadCount } from "./hooks/useNotifications";

const TYPE_ICON: Record<NotificationType, IconType> = {
  ORDER_STATUS: PiPackage,
  ORDER_PAID: PiReceipt,
  CUSTOM_REQUEST: PiChatsCircle,
  CUSTOM_MESSAGE: PiChatCircleText,
  CUSTOM_QUOTE: PiTag,
  NEW_PRODUCT: PiFlowerTulip,
};

function NotificationItem({ item, onRead }: { item: AppNotification; onRead: (id: string) => void }) {
  const Icon = TYPE_ICON[item.type] ?? PiBell;
  const content = (
    <>
      <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft text-accent-text">
        {item.imageUrl ? <Image src={item.imageUrl} alt="" fill sizes="40px" className="object-cover" /> : <Icon aria-hidden="true" size={18} />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className={`text-sm leading-snug text-ink ${item.isRead ? "" : "font-semibold"}`}>{item.title}</span>
        {item.body && <span className="line-clamp-2 text-xs leading-relaxed text-ink-muted wrap-anywhere">{item.body}</span>}
        <span className="text-xs text-ink-muted">
          <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
          {item.isAnnouncement && " · Announcement"}
        </span>
      </span>
      {/* titik belum dibaca + teks untuk pembaca layar (tidak hanya warna) */}
      {!item.isRead && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary">
          <span className="sr-only">Unread</span>
        </span>
      )}
    </>
  );
  const className = `flex w-full items-start gap-3 rounded-lg px-3 py-3 transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
    item.isRead ? "" : "bg-accent-soft/30"
  }`;
  const markRead = () => !item.isRead && onRead(item.id);

  return (
    <li>
      {item.href ? (
        <Link href={item.href} onClick={markRead} className={className}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={markRead} className={`${className} cursor-pointer`}>
          {content}
        </button>
      )}
    </li>
  );
}

// lonceng notifikasi di navbar (customer & admin): angka belum dibaca + dropdown daftar terbaru
export function NotificationBell() {
  const panelId = useId();
  const titleId = useId();
  const { isOpen, close, toggle, containerProps } = useDropdown();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotificationList(isOpen);
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const items = data?.pages.flatMap((page) => page.notifications) ?? [];
  const badge = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div className="relative" {...containerProps}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        className="btn btn-ghost btn-square relative size-11 text-ink"
      >
        <PiBell aria-hidden="true" size={22} />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] leading-5 font-bold text-primary-content ring-2 ring-base-100"
          >
            {badge}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* lapisan transparan: sentuh di luar panel -> tertutup */}
          <div aria-hidden="true" onClick={close} className="fixed inset-0 z-40" />

          {/* HP: selebar layar di bawah navbar; sm ke atas: dropdown di bawah lonceng */}
          <section
            id={panelId}
            aria-labelledby={titleId}
            className="fixed inset-x-2 top-16 z-50 flex max-h-[min(32rem,calc(100dvh-5rem))] flex-col rounded-box border border-base-300 bg-base-100 shadow-lg sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96"
          >
            <header className="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-3">
              <h2 id={titleId} className="text-base font-semibold text-ink">
                Notifications
              </h2>
              <button
                type="button"
                onClick={() => markAllRead()}
                disabled={unreadCount === 0 || isMarkingAll}
                className="btn btn-ghost btn-sm h-9 gap-1.5 px-2 text-sm text-primary disabled:bg-transparent"
              >
                <PiChecks aria-hidden="true" size={16} />
                Mark all read
              </button>
            </header>

            <div className="flex-1 overflow-y-auto overscroll-contain p-2">
              {isPending && (
                <ul aria-label="Loading notifications" className="flex flex-col gap-2 p-1">
                  {Array.from({ length: 4 }, (_, index) => (
                    <li key={index} className="flex gap-3 px-2 py-2">
                      <span className="skeleton size-10 shrink-0 rounded-full" />
                      <span className="flex flex-1 flex-col gap-2">
                        <span className="skeleton h-3.5 w-3/4" />
                        <span className="skeleton h-3 w-1/2" />
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {isError && (
                <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
                  <p className="text-sm text-ink-muted">Couldn&apos;t load notifications.</p>
                  <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm h-9">
                    Try again
                  </button>
                </div>
              )}

              {data && items.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <PiBell aria-hidden="true" size={32} className="text-ink-muted" />
                  <p className="text-sm font-medium text-ink">You&apos;re all caught up</p>
                  <p className="text-xs text-ink-muted">Order updates, messages, and new arrivals will show up here.</p>
                </div>
              )}

              {items.length > 0 && (
                <ul className="flex flex-col gap-0.5">
                  {items.map((item) => (
                    <NotificationItem key={item.id} item={item} onRead={markRead} />
                  ))}
                </ul>
              )}

              {hasNextPage && (
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="btn btn-ghost btn-sm mt-1 h-10 w-full text-sm text-ink"
                >
                  {isFetchingNextPage && <span aria-hidden="true" className="loading loading-spinner loading-xs" />}
                  {isFetchingNextPage ? "Loading..." : "Load more"}
                </button>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
