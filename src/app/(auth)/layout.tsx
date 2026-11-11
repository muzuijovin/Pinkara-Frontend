import AuthFooter from "@/components/layout/auth-footer";
import AuthNavbar from "@/components/layout/auth-navbar";
import { SkipLink } from "@/components/layout/skipLink";

// halaman auth punya navbar & footer sendiri yang ringkas
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <AuthNavbar />
      <main id="main-content" className="flex-1 bg-page">
        {children}
      </main>
      <AuthFooter />
    </>
  );
}
