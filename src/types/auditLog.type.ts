import type { PaginationMeta } from "./api-response.type";

// jenis data yang dicatat di audit log (sama dengan AUDIT_ENTITIES di BE)
export type AuditEntity = "product" | "addon" | "category" | "order" | "gallery";

export type AuditLog = {
  id: string;
  entity: AuditEntity;
  entityId: string;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  reason: string | null;
  createdAt: string;
  actor: { id: string; name: string; email: string; role: string } | null;
  // nama yang bisa dibaca (kode pesanan / nama produk) + link ke halaman admin-nya; null kalau sudah dihapus
  target: { label: string | null; href: string | null };
};

export type AuditLogMeta = PaginationMeta & { totalLogs: number };

export type AuditLogFilters = {
  actors: { id: string; name: string }[];
  actions: string[];
};

export type AuditLogParams = {
  page: number;
  entity?: AuditEntity;
  action?: string;
  actorId?: string;
  from?: string;
  to?: string;
};
