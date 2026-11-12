// tanggal ditampilkan dalam WIB (PRD §14), contoh "12 November 2026"
export function formatDateWIB(value: string | Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(
    new Date(value),
  );
}

// Date -> format value <input type="datetime-local"> (waktu lokal, contoh "2026-10-21T15:00")
export function toDateTimeLocal(value: string | Date) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

// waktu relatif singkat untuk notifikasi: "Just now", "5 min ago", "3 hr ago", "2 days ago", lalu tanggal
export function formatRelativeTime(value: string | Date, now = Date.now()) {
  const seconds = Math.round((now - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return formatDateWIB(value);
}

// tanggal + jam dalam WIB, contoh "12 Nov 2026, 19:45 WIB" (batas bayar, riwayat status)
export function formatDateTimeWIB(value: string | Date) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
  return `${formatted} WIB`;
}
