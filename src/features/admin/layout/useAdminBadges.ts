import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";

// angka bulat di menu admin: yang perlu ditindak & baru sejak admin terakhir membuka menu itu
// orders = pesanan baru dibayar; orderRefunds = pesanan batal yang perlu direfund (dibatalkan pembeli / penjual,
// masalah bayar) atau pembeli baru mengisi rekening refund
export type AdminBadges = { orders: number; orderRefunds: number; customRequests: number; payments: number };
export type AdminBadgeKey = keyof AdminBadges;

// GET /admin/dashboard/badges -> diambil ulang tiap 30 detik & setiap pindah halaman (pathname ikut di key),
// supaya angka langsung hilang setelah daftar dibuka (BE mencatat "sudah dilihat" saat daftar diambil)
export function useAdminBadges(pathname: string) {
  return useQuery({
    queryKey: ["admin", "badges", pathname],
    queryFn: async () => (await axiosInstance.get<ApiResponse<AdminBadges>>("/admin/dashboard/badges")).data.data,
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}
