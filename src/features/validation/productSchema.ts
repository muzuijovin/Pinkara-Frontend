import * as z from "zod";

// aturan disamakan dengan BE (validators/products.validator.ts, productsCreateSchema)

export const PRODUCT_TYPES = ["READY", "CUSTOM"] as const;
export const PRODUCT_SIZES = ["S", "M", "L", "XL"] as const;
export const ADDON_TYPES = ["PACKAGING", "PAPER_BAG", "GIFT_CARD"] as const;

export const MAX_VARIANTS = 20;
export const MAX_PRODUCT_IMAGES = 8;
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const DESCRIPTION_MAX = 5000;

// angka di form disimpan sebagai string (input kosong tidak jadi NaN), diubah ke number saat submit
const wholeNumber = (label: string, { min, max }: { min: number; max?: number }) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .regex(/^\d+$/, `${label} must be a whole number`)
    .refine((value) => Number(value) >= min, `${label} must be at least ${min}`)
    .refine((value) => max === undefined || Number(value) <= max, `${label} must be at most ${max}`);

const variantSchema = z.object({
  // terisi = varian lama (mode edit), kosong = varian baru
  variantId: z.string().optional(),
  label: z.string().trim().min(1, "Label is required").max(20, "Label must be at most 20 characters"),
  price: wholeNumber("Price", { min: 1 }),
  stock: wholeNumber("Stock", { min: 0 }),
  sku: z.string().trim().max(50, "SKU must be at most 50 characters"),
  // "" = produk ini tidak cocok pakai kardus
  packageSize: z.enum(["", ...PRODUCT_SIZES]),
  // false = varian disembunyikan dari pembeli (hanya bisa diatur saat edit)
  isActive: z.boolean(),
});

export const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Product name must be at least 3 characters")
      .max(100, "Product name must be at most 100 characters"),
    categoryId: z.string().min(1, "Please choose a category"),
    type: z.enum(PRODUCT_TYPES),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(DESCRIPTION_MAX, `Description must be at most ${DESCRIPTION_MAX} characters`),
    variants: z.array(variantSchema).max(MAX_VARIANTS, `Up to ${MAX_VARIANTS} variants`),
    basePrice: z.string().trim(),
    productionDays: z.string().trim(),
    dimensions: z.string().trim().max(100, "Dimensions must be at most 100 characters"),
    materials: z.string().trim().max(1000, "Materials must be at most 1000 characters"),
    isFeatured: z.boolean(),
    // true = ikut add-on default kategori (field tidak dikirim ke BE)
    useCategoryAddons: z.boolean(),
    allowedAddonTypes: z.array(z.enum(ADDON_TYPES)),
  })
  .superRefine((data, ctx) => {
    if (data.type === "READY") {
      if (!data.variants.length) {
        ctx.addIssue({ code: "custom", path: ["variants"], message: "Add at least 1 variant" });
      } else if (!data.variants.some((variant) => variant.isActive)) {
        ctx.addIssue({ code: "custom", path: ["variants"], message: "Keep at least 1 variant available for sale" });
      }
      const labels = data.variants.map((variant) => variant.label.trim().toLowerCase());
      labels.forEach((label, index) => {
        if (label && labels.indexOf(label) !== index) {
          ctx.addIssue({ code: "custom", path: ["variants", index, "label"], message: "Label must be unique" });
        }
      });
    }

    if (data.type === "CUSTOM") {
      const basePrice = wholeNumber("Starting price", { min: 1 }).safeParse(data.basePrice);
      if (!basePrice.success) {
        ctx.addIssue({ code: "custom", path: ["basePrice"], message: basePrice.error.issues[0].message });
      }
    }

    if (data.productionDays) {
      const days = wholeNumber("Production time", { min: 1, max: 90 }).safeParse(data.productionDays);
      if (!days.success) {
        ctx.addIssue({ code: "custom", path: ["productionDays"], message: days.error.issues[0].message });
      }
    }
  });

export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = ProductInput["variants"][number];

export const EMPTY_VARIANT: VariantInput = { label: "", price: "", stock: "0", sku: "", packageSize: "", isActive: true };
