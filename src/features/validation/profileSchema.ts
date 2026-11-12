import * as z from "zod";

// aturan disamakan dengan BE (validators/users.validator.ts & addresses.validator.ts)

// "+62 812-3456-789" / "62812..." / "0812..." -> dicek dalam bentuk 08xx (BE juga menormalkan begini)
export const normalizePhone = (value: string) =>
  value.replace(/[\s-]/g, "").replace(/^(\+?62)/, "0");

const PHONE_REGEX = /^08[1-9][0-9]{6,11}$/;
const PHONE_MESSAGE = "Please enter a valid phone number, e.g. 081234567890";

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  // boleh dikosongkan
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || PHONE_REGEX.test(normalizePhone(value)), PHONE_MESSAGE),
});

export const addressSchema = z.object({
  label: z.string().trim().max(50, "Label must be at most 50 characters"),
  recipientName: z
    .string()
    .trim()
    .min(2, "Recipient name must be at least 2 characters")
    .max(100, "Recipient name must be at most 100 characters"),
  recipientPhone: z
    .string()
    .trim()
    .min(1, "Recipient phone number is required")
    .refine((value) => PHONE_REGEX.test(normalizePhone(value)), PHONE_MESSAGE),
  fullAddress: z
    .string()
    .trim()
    .min(10, "Full address must be at least 10 characters")
    .max(500, "Full address must be at most 500 characters"),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be at most 100 characters"),
  postalCode: z.string().trim().regex(/^[0-9]{5}$/, "Postal code must be 5 digits"),
  isDefault: z.boolean(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

// foto profil: sama dengan batas uploadMiddleware BE
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
