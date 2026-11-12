import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { RequireAuth } from "@/hoc/authGuard";

// layout panel admin: hanya role ADMIN (BE tetap cek role di setiap request, PRD §12.1)
// sidebar admin menyusul
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" className="flex-1 bg-page">
      <Suspense fallback={<PageLoader />}>
        <RequireAuth roles={["ADMIN"]}>{children}</RequireAuth>
      </Suspense>
    </main>
  );
}
