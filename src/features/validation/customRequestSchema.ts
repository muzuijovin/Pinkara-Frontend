import * as z from "zod";

// aturan disamakan dengan BE (validators/custom-requests.validator.ts)
export const CUSTOM_MIN_LEAD_DAYS = 3;
export const MAX_REFERENCE_IMAGES = 5;
export const MAX_MESSAGE_ATTACHMENTS = 3;
export const CUSTOM_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const CUSTOM_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// tanggal WIB + n hari dalam format yyyy-MM-dd (nilai <input type="date">)
export function wibDateOffset(days: number, now = new Date()) {
  return new Date(now.getTime() + 7 * 3600_000 + days * 86400_000).toISOString().slice(0, 10);
}

export const briefSchema = z.object({
  size: z.string().trim().min(2, "Please describe the size").max(100, "Size must be at most 100 characters"),
  colors: z.string().trim().min(2, "Please describe the colors").max(200, "Colors must be at most 200 characters"),
  flowers: z.string().trim().min(2, "Please describe the flowers").max(300, "Flowers must be at most 300 characters"),
  cardMessage: z.string().trim().max(200, "Card message must be at most 200 characters"),
  notes: z.string().trim().max(1000, "Notes must be at most 1000 characters"),
  budget: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d+$/.test(value), "Budget must be a whole number"),
  neededBy: z
    .string()
    .min(1, "Please choose a date")
    .refine((value) => value >= wibDateOffset(CUSTOM_MIN_LEAD_DAYS), `Choose a date at least ${CUSTOM_MIN_LEAD_DAYS} days from today`),
});

export type BriefInput = z.infer<typeof briefSchema>;

// form penawaran admin
export const quotationSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().trim().min(2, "Item name is too short").max(100),
        quantity: z.string().regex(/^\d+$/, "Whole number").refine((v) => Number(v) >= 1 && Number(v) <= 99, "1–99"),
        unitPrice: z.string().regex(/^\d+$/, "Whole number").refine((v) => Number(v) >= 1, "Must be more than 0"),
      }),
    )
    .min(1, "Add at least 1 item"),
  addons: z.array(z.object({ addonId: z.string().min(1, "Choose an add-on"), quantity: z.string().regex(/^\d+$/).refine((v) => Number(v) >= 1, "At least 1"), giftMessage: z.string().max(200) })),
  readyDate: z.string().min(1, "Please choose a date").refine((value) => value >= wibDateOffset(0), "Ready date can't be in the past"),
  notes: z.string().trim().max(2000),
  validHours: z.enum(["24", "48", "72"]),
});

export type QuotationInput = z.infer<typeof quotationSchema>;
