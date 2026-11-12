import { describe, expect, it } from "vitest";
import { applyQuantity } from "@/features/(costumer)/cart/hooks/useCart";
import { packagingOptionsFor } from "@/features/(public)/productDetail/components/addOnsSelector";
import { giftMessageError } from "@/features/(public)/productDetail/components/giftCardForm";
import { actionLabel, diffRows, formatValue, humanize } from "@/features/admin/auditLogs/auditLogTable";
import { isPaymentStatus, paymentMethodLabel } from "@/features/admin/payments/constants/paymentStatus";
import { getSafeRedirect, homeByRole } from "@/features/auth/utils/redirect";
import { isLinkActive, roleLink } from "@/features/navbar/constants/navbarData";
import type { Cart, CartItem } from "@/types/cart.type";
import type { ProductAddon } from "@/types/product.type";

// TES LOGIKA MURNI: redirect aman, menu per role, keranjang optimistic, add-on, audit log, pembayaran

describe("redirect setelah login", () => {
  it("hanya path internal yang diterima (cegah open redirect)", () => {
    expect(getSafeRedirect("/cart", "CUSTOMER")).toBe("/cart");
    expect(getSafeRedirect("//evil.com", "CUSTOMER")).toBe("/");
    expect(getSafeRedirect("/\\evil.com", "CUSTOMER")).toBe("/");
    expect(getSafeRedirect("https://evil.com", "ADMIN")).toBe("/admin");
    expect(getSafeRedirect(null, "ADMIN")).toBe("/admin");
    expect(homeByRole("CUSTOMER")).toBe("/");
  });
});

describe("navbar", () => {
  it("admin dapat 'Admin panel', customer & tamu dapat 'Custom Order'", () => {
    expect(roleLink("ADMIN")).toMatchObject({ label: "Admin panel", href: "/admin" });
    expect(roleLink("CUSTOMER").label).toBe("Custom Order");
    expect(roleLink(undefined).label).toBe("Custom Order");
  });

  it("menu aktif: beranda hanya '/', menu lain termasuk sub-halaman", () => {
    expect(isLinkActive("/", "/")).toBe(true);
    expect(isLinkActive("/products", "/")).toBe(false);
    expect(isLinkActive("/products/pink-roses", "/products?kategori=bouquet")).toBe(true);
    expect(isLinkActive("/admin/orders", "/admin", "/admin")).toBe(true);
  });
});

describe("keranjang: applyQuantity (tampilan berubah duluan sebelum respons server)", () => {
  const addon = (type: CartItem["addons"][number]["type"], quantity: number, unitPrice: number) => ({
    id: `${type}-line`,
    addonId: type,
    type,
    name: type,
    size: null,
    unitPrice,
    quantity,
    subtotal: unitPrice * quantity,
    giftMessage: null,
    senderName: null,
    hideSender: false,
    isAvailable: true,
  });
  const item = (id: string, overrides: Partial<CartItem> = {}): CartItem => ({
    id,
    quantity: 1,
    issue: null,
    product: { id: "p", name: "Roses", slug: "roses", image: null },
    variant: { id: "v", label: "M", price: 100000, stock: 5, packageSize: "M" },
    addons: [],
    lineTotal: 100000,
    ...overrides,
  });
  const cart = (items: CartItem[]): Cart => ({ items, summary: { itemCount: 0, subtotal: 0, hasIssues: false } });

  it("kardus ikut jumlah, paper bag maks jumlah+2, gift card tetap; total dihitung ulang", () => {
    const start = item("a", { addons: [addon("PACKAGING", 1, 15000), addon("PAPER_BAG", 3, 5000), addon("GIFT_CARD", 1, 10000)] });
    const next = applyQuantity(cart([start]), "a", 3);
    const [line] = next.items;
    expect(line.addons.map((a) => a.quantity)).toEqual([3, 3, 1]);
    expect(line.lineTotal).toBe(100000 * 3 + 15000 * 3 + 5000 * 3 + 10000);
    expect(next.summary).toEqual({ itemCount: 3, subtotal: line.lineTotal, hasIssues: false });

    // turun ke 1: paper bag 3 -> min(3, 1+2) = 3 tetap
    expect(applyQuantity(next, "a", 1).items[0].addons[1].quantity).toBe(3);
  });

  it("masalah stok kurang hilang kalau jumlah sudah sesuai stok; baris bermasalah tidak masuk subtotal", () => {
    const short = item("a", { quantity: 8, issue: "INSUFFICIENT_STOCK", lineTotal: 800000 });
    const other = item("b", { issue: "UNAVAILABLE" as CartItem["issue"] });
    const fixed = applyQuantity(cart([short, other]), "a", 5);
    expect(fixed.items[0].issue).toBeNull();
    expect(fixed.summary).toMatchObject({ itemCount: 6, subtotal: 500000, hasIssues: true });
  });
});

describe("add-on produk", () => {
  const box = (size: "S" | "M" | "L" | "XL") => ({ id: size, type: "PACKAGING", size, name: `Box ${size}`, price: 10000 }) as unknown as ProductAddon;

  it("kardus yang boleh: ukuran >= ukuran produk, urut kecil ke besar", () => {
    const addons = [box("XL"), box("S"), box("M"), { id: "bag", type: "PAPER_BAG", size: null } as unknown as ProductAddon];
    expect(packagingOptionsFor(addons, "M").map((a) => a.id)).toEqual(["M", "XL"]);
    expect(packagingOptionsFor(addons, null)).toEqual([]);
  });

  it("gift card: emoji ditolak (tidak bisa dicetak)", () => {
    expect(giftMessageError("Happy birthday!")).toBeUndefined();
    expect(giftMessageError("Happy birthday 🎉")).toContain("Emoji");
  });
});

describe("audit log", () => {
  it("nama aksi & kolom yang bisa dibaca", () => {
    expect(actionLabel("status_change")).toBe("Status changed");
    expect(actionLabel("payment_check")).toBe("Payment checked");
    expect(actionLabel("bulk_import")).toBe("Bulk import");
    expect(humanize("lowStockThreshold")).toBe("Low stock threshold");
  });

  it("format nilai sebelum/sesudah", () => {
    expect(formatValue(null)).toBe("—");
    expect(formatValue(true)).toBe("Yes");
    expect(formatValue(150000)).toBe("150.000");
    expect(formatValue(["PACKAGING", "GIFT_CARD"])).toBe("PACKAGING, GIFT_CARD");
    expect(formatValue([{ id: 1 }, { id: 2 }])).toBe("2 items");
  });

  it("diffRows: hanya kolom yang berubah; catatan baru menampilkan semua", () => {
    expect(diffRows({ price: 10, name: "A" }, { price: 12, name: "A" })).toEqual([{ key: "price", before: 10, after: 12 }]);
    expect(diffRows(null, { caption: "Hi", isActive: true }).map((row) => row.key)).toEqual(["caption", "isActive"]);
  });
});

describe("pembayaran", () => {
  it("label metode & cek status", () => {
    expect(paymentMethodLabel("QRIS", null)).toBe("QRIS");
    expect(paymentMethodLabel("VIRTUAL_ACCOUNT", "bca")).toBe("BCA Virtual Account");
    expect(paymentMethodLabel("VIRTUAL_ACCOUNT", null)).toBe("Virtual Account");
    expect(isPaymentStatus("PAID")).toBe(true);
    expect(isPaymentStatus("LUNAS")).toBe(false);
    expect(isPaymentStatus(null)).toBe(false);
  });
});
