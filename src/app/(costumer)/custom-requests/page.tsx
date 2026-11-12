import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { CustomRequestList } from "@/features/(costumer)/customRequest/customRequestList";

export const metadata: Metadata = { title: "My Custom Requests | Pinkara Studio" };

// daftar pengajuan custom milik pembeli (PRD §8)
// CustomRequestList baca ?status=&page= (useSearchParams) -> perlu Suspense karena cacheComponents aktif
export default function CustomRequestsPage() {
  return (
    <div className="bg-page">
      <Suspense fallback={<PageLoader />}>
        <CustomRequestList />
      </Suspense>
    </div>
  );
}
