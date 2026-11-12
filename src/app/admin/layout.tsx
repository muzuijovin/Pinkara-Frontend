import { Suspense } from "react";
import Navbar from "@/components/layout/navbar";
import { SkipLink } from "@/components/layout/skipLink";
import { PageLoader } from "@/components/ui/pageLoader";
import { AdminSidebar } from "@/features/admin/layout/adminSidebar";
import { RequireAuth } from "@/hoc/authGuard";

// layout panel admin: hanya role ADMIN (BE tetap cek role di setiap request, PRD §12.1)
// navbar sama dengan halaman lain (admin tidak punya ikon keranjang) + sidebar menu admin di kiri
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <RequireAuth roles={["ADMIN"]}>
          <div className="flex flex-1 flex-col bg-page lg:flex-row">
            {/* AdminSidebar pakai usePathname -> perlu Suspense karena cacheComponents aktif */}
            <Suspense fallback={<div className="hidden w-68 shrink-0 border-r border-base-300 bg-base-100 lg:block" />}>
              <AdminSidebar />
            </Suspense>
            <main id="main-content" className="min-w-0 flex-1">
              {children}
            </main>
          </div>
        </RequireAuth>
      </Suspense>
    </>
  );
}
