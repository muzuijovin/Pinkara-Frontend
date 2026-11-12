import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiListResponse, ApiResponse } from "@/types/api-response.type";
import type { AuditLog, AuditLogFilters, AuditLogMeta, AuditLogParams } from "@/types/auditLog.type";

// GET /admin/audit-logs -> riwayat perubahan, terbaru dulu
export function useAuditLogs(params: AuditLogParams) {
  return useQuery({
    queryKey: ["admin", "audit-logs", "list", params],
    queryFn: async () => {
      const res = await axiosInstance.get<ApiListResponse<AuditLog, AuditLogMeta>>("/admin/audit-logs", { params });
      return { logs: res.data.data, meta: res.data.meta };
    },
    placeholderData: keepPreviousData,
  });
}

// GET /admin/audit-logs/filters -> pilihan admin & aksi untuk dropdown filter
export function useAuditLogFilters() {
  return useQuery({
    queryKey: ["admin", "audit-logs", "filters"],
    queryFn: async () => (await axiosInstance.get<ApiResponse<AuditLogFilters>>("/admin/audit-logs/filters")).data.data,
    staleTime: 5 * 60 * 1000,
  });
}
