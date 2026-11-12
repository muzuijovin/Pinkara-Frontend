import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { ShippingRates } from "@/types/shipping.type";

export const SHIPPING_RATES_KEY = ["shipping-rates"] as const;

// GET /shipping/rates -> pilihan kurir untuk keranjang (atau penawaran custom kalau ada quotationId).
// Tarif disimpan 2 menit; server tetap menghitung ulang saat pesanan dibuat
export function useShippingRates({ addressId, quotationId, enabled = true }: { addressId: string | null; quotationId?: string; enabled?: boolean }) {
  return useQuery({
    queryKey: [...SHIPPING_RATES_KEY, addressId, quotationId ?? null],
    queryFn: async () =>
      (await axiosInstance.get<ApiResponse<ShippingRates>>("/shipping/rates", { params: { addressId, quotationId } })).data.data,
    enabled: enabled && Boolean(addressId),
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
}
