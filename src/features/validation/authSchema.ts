import * as z from "zod";

// aturan disamakan dengan BE (validators/auths.validator.ts) supaya error ketahuan sebelum submit

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .pipe(z.email("Please enter a valid email address").max(255, "Email must be at most 255 characters"));

export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "1 uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "1 lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "1 number", test: (value: string) => /[0-9]/.test(value) },
];

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
  .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
  .regex(/[0-9]/, "Password must contain at least 1 number");

const confirmPassword = z.string().min(1, "Please confirm your password");

const passwordsMatch = {
  message: "Passwords do not match",
  path: ["confirmPassword"],
};

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
    email,
    password: strongPassword,
    confirmPassword,
  })
  .refine((data) => data.password === data.confirmPassword, passwordsMatch);

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ newPassword: strongPassword, confirmPassword })
  .refine((data) => data.newPassword === data.confirmPassword, passwordsMatch);

// currentPassword boleh kosong untuk akun Google yang belum punya password (dicek BE)
export const changePasswordSchema = z
  .object({ currentPassword: z.string(), newPassword: strongPassword, confirmPassword })
  .refine((data) => data.newPassword === data.confirmPassword, passwordsMatch);

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
