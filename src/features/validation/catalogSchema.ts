import * as z from "zod";
import { ADDON_TYPES, PRODUCT_SIZES } from "./productSchema";

// aturan disamakan dengan BE (validators/admin-catalog.validator.ts)
const wholeNumber = (label: string, min: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .regex(/^\d+$/, `${label} must be a whole number`)
    .refine((value) => Number(value) >= min, `${label} must be at least ${min}`);

export const addonSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
    type: z.enum(ADDON_TYPES),
    size: z.enum(["", ...PRODUCT_SIZES]),
    price: wholeNumber("Price", 0),
    stock: wholeNumber("Stock", 0), // stok awal, hanya saat tambah
    lowStockThreshold: wholeNumber("Low-stock alert", 0),
    isActive: z.boolean(),
  })
  .refine((data) => data.type !== "PACKAGING" || data.size !== "", { message: "Choose a box size", path: ["size"] });

export type AddonInput = z.infer<typeof addonSchema>;

export const stockAdjustSchema = z.object({
  direction: z.enum(["add", "remove"]),
  amount: wholeNumber("Amount", 1).refine((value) => Number(value) <= 10_000, "Amount is too large"),
  reason: z.enum(["RESTOCK", "DAMAGED", "CORRECTION"]),
  note: z.string().trim().max(200, "Note must be at most 200 characters"),
});

export type StockAdjustInput = z.infer<typeof stockAdjustSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  isActive: z.boolean(),
  defaultAddonTypes: z.array(z.enum(ADDON_TYPES)),
});

export type CategoryInput = z.infer<typeof categorySchema>;
