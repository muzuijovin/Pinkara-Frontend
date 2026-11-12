import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiListResponse, ApiResponse, PaginationMeta } from "@/types/api-response.type";
import type { AdminOrderDetail, AdminOrderListItem, AdminOrderStatusCounts, OrderStatus } from "@/types/order.type";

export type AdminOrdersParams = { page: number; status?: OrderStatus; search?: string };

const adminOrderKey = (code: string) => ["admin", "orders", code] as const;

// GET /admin/orders -> daftar pesanan + jumlah per status untuk tab
export function useAdminOrders(params: AdminOrdersParams) {
  return useQuery({
    queryKey: ["admin", "orders", "list", params],
    queryFn: async () => {
      const res = await axiosInstance.get<
        ApiListResponse<AdminOrderListItem, PaginationMeta & { totalOrders: number; statusCounts: AdminOrderStatusCounts }>
      >("/admin/orders", { params: { page: params.page, status: params.status, search: params.search || undefined } });
      return { orders: res.data.data, meta: res.data.meta };
    },
    placeholderData: keepPreviousData,
    // pesanan baru / dibayar bisa masuk kapan saja
    refetchOnWindowFocus: true,
  });
}

// GET /admin/orders/:code
export function useAdminOrder(code: string) {
  return useQuery({
    queryKey: adminOrderKey(code),
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<AdminOrderDetail>>(`/admin/orders/${code}`);
      return res.data.data;
    },
    enabled: Boolean(code),
    retry: false,
    refetchOnWindowFocus: true,
  });
}

// semua aksi admin dibalas detail pesanan terbaru -> ganti cache detail, daftar diambil ulang
function useAdminOrderAction<TVariables>(code: string, request: (variables: TVariables) => Promise<AdminOrderDetail>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: request,
    onSuccess: (order) => {
      queryClient.setQueryData(adminOrderKey(code), order);
      return queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
    },
    // 409 = status sudah diubah admin lain -> ambil data terbaru
    onError: () => queryClient.invalidateQueries({ queryKey: adminOrderKey(code) }),
  });
}

export type UpdateStatusVariables = {
  status: Extract<OrderStatus, "DIKEMAS" | "DIPRODUKSI" | "SIAP_KIRIM" | "DIKIRIM" | "SELESAI">;
  courier?: string;
  trackingNo?: string;
};

// PATCH /admin/orders/:code/status
export function useUpdateOrderStatus(code: string) {
  return useAdminOrderAction(code, async (body: UpdateStatusVariables) => {
    const res = await axiosInstance.patch<ApiResponse<AdminOrderDetail>>(`/admin/orders/${code}/status`, body);
    return res.data.data;
  });
}

// POST /admin/orders/:code/cancel
export function useCancelOrder(code: string) {
  return useAdminOrderAction(code, async (reason: string) => {
    const res = await axiosInstance.post<ApiResponse<AdminOrderDetail>>(`/admin/orders/${code}/cancel`, { reason });
    return res.data.data;
  });
}

// POST /admin/orders/:code/refund
export function useRefundOrder(code: string) {
  return useAdminOrderAction(code, async (body: { amount: number; reason: string }) => {
    const res = await axiosInstance.post<ApiResponse<AdminOrderDetail>>(`/admin/orders/${code}/refund`, body);
    return res.data.data;
  });
}

// PATCH /admin/orders/:code/addons/:addonId -> centang "sudah dikemas"
export function usePackAddon(code: string) {
  return useAdminOrderAction(code, async ({ addonId, packed }: { addonId: string; packed: boolean }) => {
    const res = await axiosInstance.patch<ApiResponse<AdminOrderDetail>>(`/admin/orders/${code}/addons/${addonId}`, { packed });
    return res.data.data;
  });
}

// POST /admin/orders/:code/progress-photos (multipart: photo + caption) -> khusus pesanan custom
export function useAddProgressPhoto(code: string) {
  return useAdminOrderAction(code, async ({ file, caption }: { file: File; caption: string }) => {
    const formData = new FormData();
    formData.append("photo", file);
    if (caption.trim()) formData.append("caption", caption.trim());
    const res = await axiosInstance.post<ApiResponse<AdminOrderDetail>>(`/admin/orders/${code}/progress-photos`, formData);
    return res.data.data;
  });
}
