import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { CART_QUERY_KEY } from "@/features/(costumer)/cart/hooks/useCart";
import { orderQueryKey } from "@/features/(costumer)/orders/hooks/useOrder";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { Cart } from "@/types/cart.type";
import type { CheckoutErrorCode, CheckoutPreview, OrderDetail, PaymentMethod, ShippingMethod } from "@/types/order.type";

export const CHECKOUT_PREVIEW_KEY = ["checkout", "preview"] as const;

// GET /orders/checkout -> harga terbaru, ongkir, promo yang berhak. Selalu diambil ulang
// (harga, stok & kuota promo bisa berubah kapan saja)
export function useCheckoutPreview() {
  return useQuery({
    queryKey: CHECKOUT_PREVIEW_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<CheckoutPreview>>("/orders/checkout");
      return res.data.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export type PlaceOrderVariables = {
  // 1 key per sesi checkout (PRD §13.3): klik dobel / request diulang -> pesanan yang sama, bukan pesanan baru
  idempotencyKey: string;
  shippingMethod: ShippingMethod;
  addressId?: string;
  paymentMethod: PaymentMethod;
  buyerNote?: string;
  expectedTotal: number; // total yang dilihat pembeli; beda dengan hitungan server -> PRICE_CHANGED
};

const EMPTY_CART: Cart = { items: [], summary: { itemCount: 0, subtotal: 0, hasIssues: false } };

// POST /orders
export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ idempotencyKey, ...body }: PlaceOrderVariables) => {
      const res = await axiosInstance.post<ApiResponse<OrderDetail>>("/orders", body, {
        headers: { "Idempotency-Key": idempotencyKey },
      });
      return res.data.data;
    },
    onSuccess: (order) => {
      // keranjang sudah dikosongkan BE, detail pesanan langsung siap untuk halaman bayar
      queryClient.setQueryData(CART_QUERY_KEY, EMPTY_CART);
      queryClient.setQueryData(orderQueryKey(order.code), order);
      queryClient.removeQueries({ queryKey: CHECKOUT_PREVIEW_KEY });
      return queryClient.invalidateQueries({ queryKey: ["products"] }); // stok berubah
    },
  });
}

// kode error checkout dari BE, mis. { code: "PRICE_CHANGED", total: 150000 }
export function getCheckoutError(error: unknown) {
  if (!isAxiosError(error)) return null;
  const data = error.response?.data?.data as { code?: CheckoutErrorCode; total?: number } | undefined;
  return data?.code ? { code: data.code, total: data.total } : null;
}
