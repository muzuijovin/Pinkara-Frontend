import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, resetPasswordSchema } from "@/features/validation/authSchema";
import { addonSchema, categorySchema, stockAdjustSchema } from "@/features/validation/catalogSchema";
import { briefSchema, quotationSchema, wibDateOffset } from "@/features/validation/customRequestSchema";
import { gallerySchema } from "@/features/validation/gallerySchema";
import { EMPTY_VARIANT, productSchema, type ProductInput } from "@/features/validation/productSchema";

// TES SKEMA FORM (disamakan dengan validator BE): error ketahuan sebelum submit

const firstError = (result: { success: boolean; error?: { issues: { message: string; path: PropertyKey[] }[] } }) => result.error?.issues[0];

describe("auth", () => {
  it("login: email dirapikan (trim + huruf kecil)", () => {
    const result = loginSchema.safeParse({ email: "  Buyer@Mail.COM ", password: "x" });
    expect(result.success && result.data.email).toBe("buyer@mail.com");
  });

  it("daftar: password lemah & konfirmasi beda ditolak", () => {
    const base = { name: "Rina", email: "rina@mail.com" };
    expect(registerSchema.safeParse({ ...base, password: "lemah", confirmPassword: "lemah" }).success).toBe(false);
    const mismatch = registerSchema.safeParse({ ...base, password: "Kuat1234", confirmPassword: "Kuat12345" });
    expect(firstError(mismatch)).toMatchObject({ message: "Passwords do not match", path: ["confirmPassword"] });
    expect(registerSchema.safeParse({ ...base, password: "Kuat1234", confirmPassword: "Kuat1234" }).success).toBe(true);
  });

  it("reset password: wajib huruf besar, kecil, angka", () => {
    expect(resetPasswordSchema.safeParse({ newPassword: "semuakecil1", confirmPassword: "semuakecil1" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ newPassword: "Benar123", confirmPassword: "Benar123" }).success).toBe(true);
  });
});

describe("produk", () => {
  const ready: ProductInput = {
    name: "Pink Roses",
    categoryId: "cat-1",
    type: "READY",
    description: "Fresh roses",
    variants: [{ ...EMPTY_VARIANT, label: "M", price: "150000", stock: "5", packageSize: "M" }],
    basePrice: "",
    productionDays: "",
    dimensions: "",
    materials: "",
    isFeatured: false,
    announce: true,
    useCategoryAddons: true,
    allowedAddonTypes: [],
  };

  it("produk ready valid (termasuk opsi announce)", () => {
    const result = productSchema.safeParse(ready);
    expect(result.success).toBe(true);
    expect(result.success && result.data.announce).toBe(true);
  });

  it("label varian kembar & semua varian disembunyikan ditolak", () => {
    const twins = productSchema.safeParse({ ...ready, variants: [ready.variants[0], { ...ready.variants[0] }] });
    expect(firstError(twins)?.message).toBe("Label must be unique");
    const hidden = productSchema.safeParse({ ...ready, variants: [{ ...ready.variants[0], isActive: false }] });
    expect(firstError(hidden)?.message).toBe("Keep at least 1 variant available for sale");
  });

  it("produk custom wajib harga mulai dari; estimasi maks 90 hari", () => {
    const custom = { ...ready, type: "CUSTOM" as const, variants: [] };
    expect(firstError(productSchema.safeParse(custom))?.path).toEqual(["basePrice"]);
    expect(productSchema.safeParse({ ...custom, basePrice: "250000" }).success).toBe(true);
    expect(firstError(productSchema.safeParse({ ...custom, basePrice: "250000", productionDays: "120" }))?.message).toBe(
      "Production time must be at most 90",
    );
  });
});

describe("katalog admin", () => {
  const addon = { name: "Box M", type: "PACKAGING" as const, size: "M" as const, price: "15000", stock: "10", lowStockThreshold: "3", isActive: true };

  it("kardus wajib ukuran; paper bag tidak", () => {
    expect(addonSchema.safeParse(addon).success).toBe(true);
    expect(firstError(addonSchema.safeParse({ ...addon, size: "" }))).toMatchObject({ message: "Choose a box size", path: ["size"] });
    expect(addonSchema.safeParse({ ...addon, type: "PAPER_BAG", size: "" }).success).toBe(true);
  });

  it("penyesuaian stok: minimal 1, maksimal 10.000", () => {
    const base = { direction: "add" as const, reason: "RESTOCK" as const, note: "" };
    expect(stockAdjustSchema.safeParse({ ...base, amount: "0" }).success).toBe(false);
    expect(stockAdjustSchema.safeParse({ ...base, amount: "10001" }).success).toBe(false);
    expect(stockAdjustSchema.safeParse({ ...base, amount: "25" }).success).toBe(true);
  });

  it("kategori: nama minimal 2 huruf", () => {
    expect(categorySchema.safeParse({ name: "A", isActive: true, defaultAddonTypes: [] }).success).toBe(false);
    expect(categorySchema.safeParse({ name: "Bloom Box", isActive: true, defaultAddonTypes: ["GIFT_CARD"] }).success).toBe(true);
  });

  it("galeri: caption boleh kosong, maks 255", () => {
    expect(gallerySchema.safeParse({ caption: "", isActive: true }).success).toBe(true);
    expect(firstError(gallerySchema.safeParse({ caption: "a".repeat(256), isActive: true }))?.message).toBe("Caption must be at most 255 characters");
  });
});

describe("custom order", () => {
  const brief = { size: "Medium", colors: "Pink", flowers: "Roses", cardMessage: "", notes: "", budget: "", neededBy: wibDateOffset(3) };

  it("tanggal dibutuhkan minimal H+3 (WIB)", () => {
    expect(briefSchema.safeParse(brief).success).toBe(true);
    expect(firstError(briefSchema.safeParse({ ...brief, neededBy: wibDateOffset(2) }))?.message).toContain("at least 3 days");
  });

  it("budget harus angka bulat", () => {
    expect(briefSchema.safeParse({ ...brief, budget: "300rb" }).success).toBe(false);
    expect(briefSchema.safeParse({ ...brief, budget: "300000" }).success).toBe(true);
  });

  it("penawaran: minimal 1 item, tanggal siap tidak boleh lewat", () => {
    const quote = { items: [{ name: "Bouquet", quantity: "1", unitPrice: "300000" }], addons: [], readyDate: wibDateOffset(1), notes: "", validHours: "48" as const };
    expect(quotationSchema.safeParse(quote).success).toBe(true);
    expect(quotationSchema.safeParse({ ...quote, items: [] }).success).toBe(false);
    expect(firstError(quotationSchema.safeParse({ ...quote, readyDate: wibDateOffset(-1) }))?.message).toBe("Ready date can't be in the past");
  });

  it("wibDateOffset memakai tanggal WIB (UTC+7)", () => {
    // 20:00 UTC tanggal 12 = tanggal 13 di WIB
    expect(wibDateOffset(0, new Date("2026-11-12T20:00:00.000Z"))).toBe("2026-11-13");
    expect(wibDateOffset(3, new Date("2026-11-12T20:00:00.000Z"))).toBe("2026-11-16");
  });
});
