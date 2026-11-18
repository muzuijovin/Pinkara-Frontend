"use client";

import Link from "next/link";
import { useState } from "react";
import { PiFlowerTulipFill, PiPauseFill, PiPlayFill } from "react-icons/pi";
import { ANNOUNCEMENTS, type Announcement } from "./constants/announcements";

// satu salinan daftar pengumuman. Marquee butuh 2 salinan identik supaya geser -50% terlihat tanpa putus;
// salinan kedua disembunyikan dari screen reader & tidak bisa di-tab (hidden)
function AnnouncementList({ items, hidden = false }: { items: Announcement[]; hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="marquee-copy flex shrink-0 items-center gap-10 pr-10">
      {items.map((item) => (
        <li key={item.text} className="flex items-center gap-10 whitespace-nowrap">
          {item.href ? (
            <Link
              href={item.href}
              tabIndex={hidden ? -1 : undefined}
              className="underline-offset-4 transition-colors hover:text-on-footer-accent hover:underline focus-visible:text-on-footer-accent focus-visible:underline focus-visible:outline-none"
            >
              {item.text}
            </Link>
          ) : (
            <span>{item.text}</span>
          )}
          <PiFlowerTulipFill aria-hidden="true" className="size-3.5 text-on-footer-accent" />
        </li>
      ))}
    </ul>
  );
}

// bar pengumuman berjalan (marquee) di bawah navbar.
// Berhenti saat di-hover / fokus keyboard / tombol pause; diam total kalau user memilih reduce motion
export function AnnouncementBar({ items = ANNOUNCEMENTS }: { items?: Announcement[] }) {
  const [paused, setPaused] = useState(false);

  if (items.length === 0) return null;

  return (
    <section aria-label="Announcements" className="bg-footer text-on-footer">
      <div className="mx-auto flex h-10 max-w-7xl items-center gap-2 pl-4 pr-2 sm:pl-6 lg:pl-8">
        <div data-paused={paused} className="marquee min-w-0 flex-1 overflow-hidden text-sm font-medium">
          <div className="marquee-track flex w-max">
            <AnnouncementList items={items} />
            <AnnouncementList items={items} hidden />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          aria-label={paused ? "Play announcements" : "Pause announcements"}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-on-footer-muted transition-colors hover:bg-white/10 hover:text-on-footer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-footer-accent motion-reduce:hidden"
        >
          {paused ? <PiPlayFill aria-hidden="true" className="size-4" /> : <PiPauseFill aria-hidden="true" className="size-4" />}
        </button>
      </div>
    </section>
  );
}
