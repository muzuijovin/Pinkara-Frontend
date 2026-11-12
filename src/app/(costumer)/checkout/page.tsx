import type { Metadata } from "next";
import { CheckoutSection } from "@/features/(costumer)/checkout/checkoutSection";

export const metadata: Metadata = { title: "Checkout | Pinkara Studio" };

// checkout: item, alamat & metode kirim, metode bayar, catatan, ringkasan + promo (PRD §7).
// Wajib login (RequireAuth di (costumer)/layout.tsx); "Place order" juga wajib email terverifikasi (dicek BE)
export default function CheckoutPage() {
  return (
    <div className="bg-page">
      <CheckoutSection />
    </div>
  );
}
