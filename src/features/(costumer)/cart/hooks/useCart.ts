import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/hooks/useSession";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { Cart, CartAddonsPayload } from "@/types/cart.type";

export const CART_QUERY_KEY = ["cart"] as const;

// GET /cart -> isi keranjang + ringkasan. Hanya untuk CUSTOMER yang login (admin & tamu tidak punya keranjang)
export function useCart() {
  const { data: user } = useSession();

  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<Cart>>("/cart");
      return res.data.data;
    },
    enabled: user?.role === "CUSTOMER",
    // stok & harga bisa berubah, jadi dicek ulang tiap kali kembali ke tab
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

// semua aksi keranjang di BE mengembalikan isi keranjang terbaru -> cukup ganti cache, tanpa fetch ulang
function useCartMutation<TVariables>(request: (variables: TVariables) => Promise<Cart>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: request,
    onSuccess: (cart) => queryClient.setQueryData(CART_QUERY_KEY, cart),
  });
}

export type AddToCartVariables = { variantId: string; quantity: number; addons: CartAddonsPayload };

// POST /cart/items
export function useAddToCart() {
  return useCartMutation(async (body: AddToCartVariables) => {
    const res = await axiosInstance.post<ApiResponse<Cart>>("/cart/items", body);
    return res.data.data;
  });
}

// PATCH /cart/items/:id -> ubah jumlah (add-on lama dipertahankan & disesuaikan BE)
export function useUpdateCartItem() {
  return useCartMutation(async ({ id, quantity }: { id: string; quantity: number }) => {
    const res = await axiosInstance.patch<ApiResponse<Cart>>(`/cart/items/${id}`, { quantity });
    return res.data.data;
  });
}

// DELETE /cart/items/:id
export function useRemoveCartItem() {
  return useCartMutation(async (id: string) => {
    const res = await axiosInstance.delete<ApiResponse<Cart>>(`/cart/items/${id}`);
    return res.data.data;
  });
}

// DELETE /cart -> kosongkan keranjang
export function useClearCart() {
  return useCartMutation(async () => {
    const res = await axiosInstance.delete<ApiResponse<Cart>>("/cart");
    return res.data.data;
  });
}
