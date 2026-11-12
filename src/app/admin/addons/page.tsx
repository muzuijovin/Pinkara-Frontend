import type { Metadata } from "next";
import { AddonTable } from "@/features/admin/addons/addonTable";

export const metadata: Metadata = { title: "Add-ons | Pinkara Admin" };

// daftar add-on: Packaging S–XL, Paper Bag, Gift Card (PRD §4.4, §12). Akses ADMIN dijaga admin/layout.tsx
export default function AdminAddonsPage() {
  return <AddonTable />;
}
