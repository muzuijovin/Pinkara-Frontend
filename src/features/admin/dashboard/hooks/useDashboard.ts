import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { DashboardOverview, DashboardPeriod, DashboardSales } from "@/types/dashboard.type";

// GET /admin/dashboard -> perlu tindakan, stok, promo, aktivitas. Diperbarui otomatis tiap 30 detik (PRD §12.2e)
export function useDashboardOverview() {
  return useQuery({
    queryKey: ["admin", "dashboard", "overview"],
    queryFn: async () => (await axiosInstance.get<ApiResponse<DashboardOverview>>("/admin/dashboard")).data.data,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

export type SalesParams = { period: DashboardPeriod; from?: string; to?: string };

// GET /admin/dashboard/sales -> ringkasan penjualan untuk periode terpilih
export function useDashboardSales(params: SalesParams) {
  return useQuery({
    queryKey: ["admin", "dashboard", "sales", params],
    queryFn: async () =>
      (await axiosInstance.get<ApiResponse<DashboardSales>>("/admin/dashboard/sales", {
        params: params.from && params.to ? { from: params.from, to: params.to } : { period: params.period },
      })).data.data,
    // angka periode sebelumnya tetap tampil selama periode baru dimuat
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}
