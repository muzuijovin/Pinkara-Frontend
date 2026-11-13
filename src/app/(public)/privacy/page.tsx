import type { Metadata } from "next";
import { PrivacyPolicy } from "@/features/(public)/legal/privacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy | Pinkara Studio",
  description: "How Pinkara Studio collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-page">
      <PrivacyPolicy />
    </div>
  );
}
