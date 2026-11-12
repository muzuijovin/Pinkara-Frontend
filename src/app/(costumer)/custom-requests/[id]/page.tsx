import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { DiscussionRoom } from "@/features/(costumer)/customRequest/discussion/discussionRoom";

export const metadata: Metadata = { title: "Custom Request | Pinkara Studio" };

// ruang diskusi custom (PRD §8). [id] berisi kode request (CST-…), bukan id internal (PRD §14)
// DiscussionRoom baca kode pakai useParams (route dinamis) -> perlu Suspense karena cacheComponents aktif
export default function CustomRequestDetailPage() {
  return (
    <div className="bg-page">
      <Suspense fallback={<PageLoader />}>
        <DiscussionRoom />
      </Suspense>
    </div>
  );
}
