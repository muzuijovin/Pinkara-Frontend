import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { formatCompactRupiah, formatPriceRange, formatRupiah } from "@/lib/currency.lib";
import { formatDateTimeWIB, formatDateWIB, formatRelativeTime } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";

// TES HELPER UMUM: format rupiah, tanggal WIB, waktu relatif notifikasi, pesan error ramah

const axiosError = (status?: number, message?: string) => {
  const config = { headers: new AxiosHeaders() };
  const response = status ? { status, statusText: "", headers: {}, config, data: message ? { message } : {} } : undefined;
  return new AxiosError("Request failed", "ERR", config, null, response);
};

describe("currency", () => {
  it("rupiah tanpa desimal & tanpa spasi", () => {
    expect(formatRupiah(150000)).toBe("Rp150.000");
    expect(formatRupiah(0)).toBe("Rp0");
  });

  it("rentang harga: satu harga kalau sama", () => {
    expect(formatPriceRange(150000, 150000)).toBe("Rp150.000");
    expect(formatPriceRange(150000, 350000)).toBe("Rp150.000 – Rp350.000");
  });

  it("angka ringkas untuk sumbu grafik", () => {
    expect(formatCompactRupiah(950)).toBe("Rp950");
    expect(formatCompactRupiah(450_000)).toBe("Rp450K");
    expect(formatCompactRupiah(1_250_000)).toBe("Rp1.3M");
    expect(formatCompactRupiah(2_000_000)).toBe("Rp2M");
    expect(formatCompactRupiah(1_500_000_000)).toBe("Rp1.5B");
  });
});

describe("datetime (WIB)", () => {
  it("tanggal & jam selalu WIB", () => {
    // 12:45 UTC = 19:45 WIB
    expect(formatDateTimeWIB("2026-11-12T12:45:00.000Z")).toBe("12 Nov 2026, 19:45 WIB");
    // 20:00 UTC tanggal 12 = tanggal 13 di WIB
    expect(formatDateWIB("2026-11-12T20:00:00.000Z")).toBe("13 November 2026");
  });

  it("waktu relatif notifikasi", () => {
    const now = new Date("2026-11-13T10:00:00.000Z").getTime();
    const ago = (ms: number) => new Date(now - ms).toISOString();
    expect(formatRelativeTime(ago(20_000), now)).toBe("Just now");
    expect(formatRelativeTime(ago(5 * 60_000), now)).toBe("5 min ago");
    expect(formatRelativeTime(ago(3 * 3_600_000), now)).toBe("3 hr ago");
    expect(formatRelativeTime(ago(26 * 3_600_000), now)).toBe("1 day ago");
    expect(formatRelativeTime(ago(3 * 86_400_000), now)).toBe("3 days ago");
    // lebih dari seminggu -> tanggal
    expect(formatRelativeTime(ago(10 * 86_400_000), now)).toBe("3 November 2026");
  });
});

describe("getErrorMessage", () => {
  it("tanpa response = masalah koneksi", () => {
    expect(getErrorMessage(axiosError())).toContain("Can't connect");
  });

  it("pesan BE teknis diganti versi ramah; pesan lain diteruskan", () => {
    expect(getErrorMessage(axiosError(401, "Invalid email or password"))).toBe("Incorrect email or password.");
    expect(getErrorMessage(axiosError(409, "This quote is no longer active"))).toBe("This quote is no longer active");
  });

  it("error server (5xx) & error non-axios -> fallback", () => {
    expect(getErrorMessage(axiosError(500, "Prisma exploded"), "Couldn't save.")).toBe("Couldn't save.");
    expect(getErrorMessage(new Error("boom"))).toBe("Something went wrong. Please try again.");
  });

  it("429 rate limit", () => {
    expect(getErrorMessage(axiosError(429, "Too many requests"))).toContain("Too many attempts");
    expect(getErrorMessage(axiosError(429, "You can submit 5 requests per hour"))).toBe("You can submit 5 requests per hour");
  });
});
