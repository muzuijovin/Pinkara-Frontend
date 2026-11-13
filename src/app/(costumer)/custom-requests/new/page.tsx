import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { BriefForm } from "@/features/(costumer)/customRequest/briefForm";
import { RequireAuth } from "@/hoc/authGuard";

export const metadata: Metadata = { title: "Custom Order Brief | Pinkara Studio" };

// form brief custom (?product=slug): ukuran, warna, bunga, tulisan kartu, tanggal dibutuhkan, foto referensi maks 5 (PRD §6.3)
// BriefForm baca ?product= (useSearchParams) -> perlu Suspense karena cacheComponents aktif.
// Hanya customer: admin yang membuka URL ini langsung dapat "Access denied"
export default function NewCustomRequestPage() {
  return (
    <div className="bg-page">
      <Suspense fallback={<PageLoader />}>
        <RequireAuth roles={["CUSTOMER"]}>
          <BriefForm />
        </RequireAuth>
      </Suspense>
    </div>
  );
}
