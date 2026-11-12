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

// Hitung isi keranjang seolah jumlah sudah berubah (optimistic update): angka, total baris & ringkasan
// langsung berubah saat diklik tanpa menunggu server. Kardus ikut jumlah produk, paper bag maks jumlah + 2
// (aturan sama dengan BE). Nilai final tetap dari respons server.
export function applyQuantity(cart: Cart, itemId: string, quantity: number): Cart {
  const items = cart.items.map((item) => {
    if (item.id !== itemId) return item;

    const addons = item.addons.map((addon) => {
      const nextQuantity =
        addon.type === "PACKAGING"
          ? quantity
          : addon.type === "PAPER_BAG"
            ? Math.min(addon.quantity, quantity + 2)
            : addon.quantity;
      return { ...addon, quantity: nextQuantity, subtotal: addon.unitPrice * nextQuantity };
    });
    const addonsTotal = addons.reduce((total, addon) => total + addon.subtotal, 0);
    const issue = item.issue === "INSUFFICIENT_STOCK" && quantity <= item.variant.stock ? null : item.issue;

    return { ...item, quantity, addons, issue, lineTotal: item.variant.price * quantity + addonsTotal };
  });

  const checkoutable = items.filter((item) => !item.issue);
  return {
    items,
    summary: {
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: checkoutable.reduce((total, item) => total + item.lineTotal, 0),
      hasIssues: checkoutable.length !== items.length,
    },
  };
}

// PATCH /cart/items/:id -> ubah jumlah (add-on lama dipertahankan & disesuaikan BE).
// Tampilan sudah diubah duluan lewat applyQuantity; respons server hanya dipasang kalau tidak ada
// klik yang lebih baru (supaya angka tidak "loncat mundur"). Gagal -> ambil ulang isi keranjang dari server
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const res = await axiosInstance.patch<ApiResponse<Cart>>(`/cart/items/${id}`, { quantity });
      return res.data.data;
    },
    onSuccess: (cart, { id, quantity }) => {
      const shown = queryClient.getQueryData<Cart>(CART_QUERY_KEY)?.items.find((item) => item.id === id);
      if (shown && shown.quantity !== quantity) return; // ada perubahan lebih baru yang sedang menunggu dikirim
      queryClient.setQueryData(CART_QUERY_KEY, cart);
    },
    onError: () => queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY }),
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
