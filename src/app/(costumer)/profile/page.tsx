import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileSection } from "@/features/(costumer)/profile/profileSection";
import { PageLoader } from "@/components/ui/pageLoader";

export const metadata: Metadata = { title: "My Profile | Pinkara Florist" };

// Profil Saya: data diri + foto, alamat pengiriman, keamanan (ganti password) — PRD §3
// ProfileSection baca ?tab= (useSearchParams) -> perlu Suspense karena cacheComponents aktif
export default function ProfilePage() {
  return (
    <div className="bg-page">
      <Suspense fallback={<PageLoader />}>
        <ProfileSection />
      </Suspense>
    </div>
  );
}
