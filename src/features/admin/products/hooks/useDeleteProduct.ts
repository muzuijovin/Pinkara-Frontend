import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import { adminProductDetailKey } from "./useAdminProductDetail";

type DeletedProduct = { id: string; name: string; slug: string; deletedAt: string };

// DELETE /products/:id (khusus ADMIN): soft delete -> hilang dari katalog, riwayat pesanan tetap utuh (PRD §12.1d)
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete<ApiResponse<DeletedProduct>>(`/products/${id}`);
      return res.data.data;
    },
    onSuccess: (product) => {
      // detail produk yang dihapus TIDAK diambil ulang (halaman edit sedang pindah ke daftar, fetch ulang = 404),
      // cukup dibuang dari cache; daftar admin & katalog publik diambil ulang
      const detailKey = adminProductDetailKey(product.id);
      queryClient.removeQueries({ queryKey: detailKey, type: "inactive" });
      return queryClient.invalidateQueries({
        queryKey: ["products"],
        predicate: (query) => query.queryKey.join("/") !== detailKey.join("/"),
      });
    },
  });
}
