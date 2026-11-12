import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/forgotPasswordForm";

export const metadata: Metadata = { title: "Forgot Password | Pinkara Florist" };

// langkah 1 lupa password: isi email -> link reset dikirim (PRD §5)
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
