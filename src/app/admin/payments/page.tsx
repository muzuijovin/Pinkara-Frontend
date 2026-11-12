import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { PaymentMonitor } from "@/features/admin/payments/paymentMonitor";

export const metadata: Metadata = { title: "Payments | Pinkara Admin" };

// pemantauan transaksi (PRD §9, §12): Midtrans mengonfirmasi otomatis, tidak ada verifikasi bukti transfer.
// PaymentMonitor baca filter dari URL (useSearchParams) -> perlu Suspense karena cacheComponents aktif
export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentMonitor />
    </Suspense>
  );
}
