import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { CustomRequestInbox } from "@/features/admin/customRequests/customRequestInbox";

export const metadata: Metadata = { title: "Custom Requests | Pinkara Admin" };

// inbox diskusi custom (PRD §12). Akses ADMIN dijaga RequireAuth di admin/layout.tsx
// CustomRequestInbox baca ?status=&search=&page= (useSearchParams) -> perlu Suspense karena cacheComponents aktif
export default function AdminCustomRequestsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CustomRequestInbox />
    </Suspense>
  );
}
