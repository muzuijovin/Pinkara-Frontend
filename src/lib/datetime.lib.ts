// Date -> format value <input type="datetime-local"> (waktu lokal, contoh "2026-10-21T15:00")
export function toDateTimeLocal(value: string | Date) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}