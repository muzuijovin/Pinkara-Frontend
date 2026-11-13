import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiListResponse, ApiResponse, PaginationMeta } from "@/types/api-response.type";
import type { OrderDetail, OrderListItem, OrderTab, VaBank } from "@/types/order.type";

export const orderQueryKey = (code: string) => ["orders", code] as const;

// GET /orders/:code -> detail pesanan milik user yang login (orang lain = 404)
export function useOrder(code: string) {
  return useQuery({
    queryKey: orderQueryKey(code),
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<OrderDetail>>(`/orders/${code}`);
      return res.data.data;
    },
    enabled: Boolean(code),
    retry: false,
    // menunggu bayar dengan tagihan aktif -> cek status tiap 5 detik, layar berubah otomatis setelah lunas (PRD §9)
    refetchInterval: (query) =>
      query.state.data?.status === "MENUNGGU_PEMBAYARAN" && query.state.data.payment?.status === "PENDING" ? 5000 : false,
  });
}

// POST /orders/:code/payments -> buat / ganti tagihan. BE membalas detail order terbaru
export function useCreatePayment(code: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { method: "QRIS" | "VIRTUAL_ACCOUNT"; bank?: VaBank }) => {
      const res = await axiosInstance.post<ApiResponse<OrderDetail>>(`/orders/${code}/payments`, body);
      return res.data.data;
    },
    onSuccess: (order) => queryClient.setQueryData(orderQueryKey(code), order),
  });
}

// POST /payments/:id/simulate -> KHUSUS mode tes (gateway mock): pura-pura sudah bayar
export function useSimulatePayment(code: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const res = await axiosInstance.post<ApiResponse<OrderDetail>>(`/payments/${paymentId}/simulate`);
      return res.data.data;
    },
    onSuccess: (order) => queryClient.setQueryData(orderQueryKey(code), order),
  });
}

// POST /payments/:id/refresh -> KHUSUS Midtrans sandbox: cek status sekarang setelah bayar di simulator
export function useRefreshSandboxPayment(code: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const res = await axiosInstance.post<ApiResponse<OrderDetail>>(`/payments/${paymentId}/refresh`);
      return res.data.data;
    },
    onSuccess: (order) => queryClient.setQueryData(orderQueryKey(code), order),
  });
}

export type OrdersParams = { status?: OrderTab; page: number };

// GET /orders -> Pesanan Saya (terbaru dulu), 10 per halaman
export function useOrders(params: OrdersParams) {
  return useQuery({
    queryKey: ["orders", "list", params],
    queryFn: async () => {
      const res = await axiosInstance.get<
        ApiListResponse<OrderListItem, PaginationMeta & { totalOrders: number }>
      >("/orders", { params: { status: params.status, page: params.page, limit: 10 } });
      return { orders: res.data.data, meta: res.data.meta };
    },
    // daftar halaman sebelumnya tetap tampil selama tab / halaman baru dimuat
    placeholderData: keepPreviousData,
  });
}
