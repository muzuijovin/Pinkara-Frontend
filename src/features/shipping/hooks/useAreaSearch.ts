import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { Area } from "@/types/shipping.type";

export const AREA_MIN_CHARS = 3;

// GET /shipping/areas?input= -> daftar wilayah resmi. Kata kunci sudah di-debounce oleh pemanggil
export function useAreaSearch(input: string) {
  const query = input.trim();
  return useQuery({
    queryKey: ["shipping-areas", query.toLowerCase()],
    queryFn: async () => (await axiosInstance.get<ApiResponse<Area[]>>("/shipping/areas", { params: { input: query } })).data.data,
    enabled: query.length >= AREA_MIN_CHARS,
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: false,
  });
}
