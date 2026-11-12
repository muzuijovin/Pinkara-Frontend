import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiListResponse, ApiResponse } from "@/types/api-response.type";
import type { ProductCardItem } from "@/types/product.type";
import type { ActivePromotion, GalleryItem } from "@/types/promotion.type";

// Produk unggulan (PRD §6.1): 4–8 produk ready stock bertanda featured.
// Belum ada yang ditandai admin -> tampilkan produk ready stock terbaru supaya section tidak kosong
export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "landing", "featured"],
    queryFn: async () => {
      const get = (params: Record<string, unknown>) =>
        axiosInstance.get<ApiListResponse<ProductCardItem>>("/products", { params: { type: "READY", limit: 8, ...params } });

      const featured = (await get({ featured: true })).data.data;
      if (featured.length) return { products: featured, isFallback: false };
      return { products: (await get({ sortBy: "createdAt", order: "desc" })).data.data, isFallback: true };
    },
    staleTime: 5 * 60 * 1000,
  });
}

// GET /promotions/active -> sisa kuota "real-time" (PRD §6.1): diambil ulang tiap 30 detik & saat kembali ke tab
export function useActivePromotion() {
  return useQuery({
    queryKey: ["promotions", "active"],
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<ActivePromotion | null>>("/promotions/active");
      return res.data.data;
    },
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

// GET /gallery -> foto hasil karya (dikelola admin)
export function useGallery() {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<GalleryItem[]>>("/gallery");
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}
