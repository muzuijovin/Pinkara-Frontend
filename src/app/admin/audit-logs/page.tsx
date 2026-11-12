import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import { AuditLogTable } from "@/features/admin/auditLogs/auditLogTable";

export const metadata: Metadata = { title: "Audit log | Pinkara Admin" };

// riwayat perubahan harga, stok, status (PRD §12). Akses ADMIN dijaga RequireAuth di admin/layout.tsx
// AuditLogTable baca filter dari URL (useSearchParams) -> perlu Suspense karena cacheComponents aktif
export default function AdminAuditLogsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AuditLogTable />
    </Suspense>
  );
}
