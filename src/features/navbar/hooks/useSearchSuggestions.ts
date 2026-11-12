import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiListResponse } from "@/types/api-response.type";
import type { ProductCardItem } from "@/types/product.type";

export const SUGGESTION_MIN_CHARS = 2;
export const SUGGESTION_LIMIT = 5;

// saran pencarian di navbar: GET /products?search=…&limit=5 (endpoint katalog publik yang sama)
export function useSearchSuggestions(keyword: string) {
  return useQuery({
    queryKey: ["products", "suggestions", keyword],
    queryFn: async () => {
      const res = await axiosInstance.get<ApiListResponse<ProductCardItem>>("/products", {
        params: { search: keyword, limit: SUGGESTION_LIMIT, page: 1 },
      });
      return res.data.data;
    },
    enabled: keyword.length >= SUGGESTION_MIN_CHARS,
    staleTime: 60 * 1000,
    // saran sebelumnya tetap tampil selama kata kunci baru dicari (daftar tidak berkedip)
    placeholderData: keepPreviousData,
  });
}
