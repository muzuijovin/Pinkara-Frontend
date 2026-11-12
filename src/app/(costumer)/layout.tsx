import { Suspense } from "react";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import { SkipLink } from "@/components/layout/skipLink";
import { PageLoader } from "@/components/ui/pageLoader";
import { RequireAuth } from "@/hoc/authGuard";

// halaman customer yang wajib login; belum login -> /login?redirect=<halaman ini>
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <Navbar />
      <main id="main-content" className="flex-1">
        {/* RequireAuth pakai usePathname -> perlu Suspense karena cacheComponents aktif */}
        <Suspense fallback={<PageLoader />}>
          <RequireAuth>{children}</RequireAuth>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
