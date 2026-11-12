import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { OrderDetail } from "@/types/order.type";

export const orderQueryKey = (code: string) => ["orders", code] as const;

// GET /orders/:code -> detail pesanan milik user yang login (orang lain = 404)
export function useOrder(code: string) {
  return useQuery({
    queryKey: orderQueryKey(code),
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<OrderDetail>>(`/orders/${code}`);
      return res.data.data;
    },
    enabled: Boolean(code),
    retry: false,
  });
}
