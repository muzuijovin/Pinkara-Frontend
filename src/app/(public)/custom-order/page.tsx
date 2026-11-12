import type { Metadata } from "next";
import { CustomOrderPage as CustomOrderSection } from "@/features/(public)/customOrder/customOrderPage";

export const metadata: Metadata = {
  title: "Custom Order | Pinkara Studio",
  description: "Design your own bouquet, bloom box, or keepsake with Pinkara Studio's florists. Send a brief, chat with us, and get a quote.",
};

// info alur Custom / Pre-Order (5 langkah) + produk custom + mulai brief (PRD §4.2, §8)
export default function CustomOrderPage() {
  return (
    <div className="bg-page">
      <CustomOrderSection />
    </div>
  );
}
