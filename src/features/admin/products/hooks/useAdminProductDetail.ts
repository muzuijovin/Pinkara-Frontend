import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { AdminProductDetail } from "@/types/product.type";

export const adminProductDetailKey = (id: string) => ["products", "admin", "detail", id] as const;

// GET /products/admin/:id (khusus ADMIN): data form edit + dampak hapus (keranjang & pesanan aktif)
export function useAdminProductDetail(id: string, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: adminProductDetailKey(id),
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<AdminProductDetail>>(`/products/admin/${id}`);
      return res.data.data;
    },
    enabled: enabled && Boolean(id),
    // form edit harus pakai data & version terbaru, jangan dari cache lama
    staleTime: 0,
  });
}
