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
