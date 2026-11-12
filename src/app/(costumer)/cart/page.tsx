import type { Metadata } from "next";
import { CartSection } from "@/features/(costumer)/cart/cartSection";

export const metadata: Metadata = { title: "Cart | Pinkara Studio" };

// keranjang (wajib login, dijaga RequireAuth di (costumer)/layout.tsx), add-on menempel per item (PRD §7).
// Figma: Keranjang (1:1914), mobile (1:3467)
export default function CartPage() {
  return (
    <div className="bg-page">
      <CartSection />
    </div>
  );
}
