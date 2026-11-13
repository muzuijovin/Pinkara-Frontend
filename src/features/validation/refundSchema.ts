import * as z from "zod";

// aturan disamakan dengan BE (validators/orders.validator.ts)
export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(3, "Please tell us why you're cancelling").max(255, "Reason must be at most 255 characters"),
});

export const refundAccountSchema = z.object({
  bankName: z.string().trim().min(2, "Bank name is required").max(50, "Bank name is too long"),
  // spasi & strip boleh diketik (dirapikan BE), isinya 6-20 angka
  accountNumber: z
    .string()
    .trim()
    .refine((value) => /^\d{6,20}$/.test(value.replace(/[\s-]/g, "")), "Account number must be 6-20 digits"),
  accountName: z.string().trim().min(2, "Account holder name is required").max(100, "Name is too long"),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type RefundAccountInput = z.infer<typeof refundAccountSchema>;
