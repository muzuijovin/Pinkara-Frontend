import type { Metadata } from "next";
import { CategorySection } from "@/features/(public)/landing/components/categorySection";
import { FeaturedProducts } from "@/features/(public)/landing/components/featuredProducts";
import { GallerySection } from "@/features/(public)/landing/components/gallerySection";
import { HeroSection } from "@/features/(public)/landing/components/heroSection";
import { OrderSteps } from "@/features/(public)/landing/components/orderSteps";
import { PromoBanner } from "@/features/(public)/landing/components/promoBanner";

export const metadata: Metadata = {
  title: "Pinkara Studio | Flower Bouquets, Bloom Boxes & Custom Arrangements",
  description:
    "Hand-arranged bouquets, bloom boxes, flower frames, and keepsakes from Pinkara Studio. Order ready-stock flowers or design your own custom arrangement.",
};

// Landing page (PRD §6.1): hero, banner promo, kategori, produk unggulan, cara pesan, galeri
export default function Home() {
  return (
    <div className="flex flex-col gap-14 bg-page pb-16 md:gap-20 md:pb-24">
      <HeroSection />
      <PromoBanner />
      <CategorySection />
      <FeaturedProducts />
      <OrderSteps />
      <GallerySection />
    </div>
  );
}
