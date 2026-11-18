import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import { SkipLink } from "@/components/layout/skipLink";
import { AnnouncementBar } from "@/features/announcement/announcementBar";

// navbar otomatis landing (tamu) / user (sudah login), footer publik lengkap
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <Navbar />
      <AnnouncementBar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
