import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiListResponse, PaginationMeta } from "@/types/api-response.type";
import type { AdminProductListItem, ProductStatus } from "@/types/product.type";

export type AdminProductsParams = {
  page: number;
  search?: string;
  status?: ProductStatus;
};

// GET /products/admin (khusus ADMIN): semua status termasuk draft, 10 per halaman
export function useAdminProducts(params: AdminProductsParams) {
  return useQuery({
    queryKey: ["products", "admin", params],
    queryFn: async () => {
      const res = await axiosInstance.get<
        ApiListResponse<AdminProductListItem, PaginationMeta & { totalProducts: number }>
      >("/products/admin", {
        params: { page: params.page, limit: 10, search: params.search || undefined, status: params.status },
      });
      return { products: res.data.data, meta: res.data.meta };
    },
    // data halaman sebelumnya tetap tampil selama halaman/filter baru dimuat (tabel tidak berkedip)
    placeholderData: keepPreviousData,
  });
}
