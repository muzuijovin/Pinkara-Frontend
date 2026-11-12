import type { Metadata } from "next";
import { AddonForm } from "@/features/admin/addons/addonForm";

export const metadata: Metadata = { title: "Add Add-on | Pinkara Admin" };

// tambah add-on (PRD §12)
export default function AdminCreateAddonPage() {
  return <AddonForm />;
}
