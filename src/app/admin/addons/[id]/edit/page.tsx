import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { EditAddonForm } from "@/features/admin/addons/addonForm";

export const metadata: Metadata = { title: "Edit Add-on | Pinkara Admin" };

// edit add-on (PRD §12). EditAddonForm baca id pakai useParams -> perlu Suspense karena cacheComponents aktif
export default function AdminEditAddonPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <EditAddonForm />
    </Suspense>
  );
}
