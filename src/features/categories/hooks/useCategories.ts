import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { Category } from "@/types/category.type";

export const CATEGORIES_QUERY_KEY = ["categories"] as const;

// GET /categories (publik). Dipakai navbar, nanti juga filter katalog & kartu kategori landing.
// Kategori jarang berubah -> cache 10 menit supaya tidak fetch ulang tiap pindah halaman
export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<Category[]>>("/categories");
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// link katalog terfilter kategori, param URL mengikuti PRD §6.2 (?kategori=bloom-box)
export const categoryHref = (slug: string) => `/products?kategori=${encodeURIComponent(slug)}`;
