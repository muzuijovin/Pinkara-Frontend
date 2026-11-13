import type { Metadata } from "next";
import { AboutPage as AboutSection } from "@/features/(public)/about/aboutPage";

export const metadata: Metadata = {
  title: "About Us | Pinkara Studio",
  description: "Pinkara Studio is a floral studio in Malang, East Java, making fresh bouquets, gift boxes, and keepsakes delivered across Indonesia.",
};

// Tentang Pinkara (menu navbar PRD §6.1)
export default function AboutPage() {
  return (
    <div className="bg-page">
      <AboutSection />
    </div>
  );
}
