import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiListResponse, PaginationMeta } from "@/types/api-response.type";
import type { ProductCardItem } from "@/types/product.type";
import { SORT_OPTIONS, type CatalogFilters } from "./useCatalogFilters";

export const CATALOG_PAGE_SIZE = 12; // PRD §6.2

// filter URL -> query GET /products (lihat productsGetSchema di BE)
function toQuery(filters: CatalogFilters) {
  const sort = SORT_OPTIONS.find((option) => option.value === filters.sort) ?? SORT_OPTIONS[0];
  return {
    page: filters.page,
    limit: CATALOG_PAGE_SIZE,
    search: filters.search || undefined,
    category: filters.categories.join(",") || undefined,
    type: filters.type?.toUpperCase(),
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    inStock: filters.inStock || undefined,
    sortBy: sort.sortBy,
    order: sort.order,
  };
}

// GET /products (publik): hanya produk ACTIVE yang belum dihapus
export function useProducts(filters: CatalogFilters) {
  const query = toQuery(filters);

  return useQuery({
    queryKey: ["products", "catalog", query],
    queryFn: async () => {
      const res = await axiosInstance.get<
        ApiListResponse<ProductCardItem, PaginationMeta & { totalProducts: number }>
      >("/products", { params: query });
      return { products: res.data.data, meta: res.data.meta };
    },
    // hasil sebelumnya tetap tampil selama filter/halaman baru dimuat (grid tidak berkedip)
    placeholderData: keepPreviousData,
  });
}
