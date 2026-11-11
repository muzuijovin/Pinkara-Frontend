import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import { SkipLink } from "@/components/layout/skipLink";

// halaman customer yang wajib login, navbar & footer sama dengan halaman publik
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
        {children}
      </main>
      <Footer />
    </>
  );
}
