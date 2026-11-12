import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { ProductDetail } from "@/types/product.type";

// GET /products/:slug (publik). Produk draft / nonaktif / dihapus -> 404 "Product not available"
export function useProductDetail(slug: string) {
  return useQuery({
    queryKey: ["products", "detail", slug],
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<ProductDetail>>(`/products/${encodeURIComponent(slug)}`);
      return res.data.data;
    },
    // 404 = produk memang tidak ada, tidak perlu dicoba ulang
    retry: (failureCount, error) => !(isAxiosError(error) && error.response?.status === 404) && failureCount < 2,
  });
}

export const isNotFoundError = (error: unknown) => isAxiosError(error) && error.response?.status === 404;
