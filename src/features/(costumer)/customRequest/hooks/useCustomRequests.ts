import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderQueryKey } from "@/features/(costumer)/orders/hooks/useOrder";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiListResponse, ApiResponse, PaginationMeta } from "@/types/api-response.type";
import type { CustomRequestDetail, CustomRequestListItem, CustomRequestStatus } from "@/types/customRequest.type";
import type { OrderDetail, PaymentMethod, ShippingMethod } from "@/types/order.type";

export const customRequestKey = (code: string) => ["custom-requests", code] as const;

// GET /custom-requests -> daftar request milik pembeli
export function useCustomRequests(params: { page: number; status?: CustomRequestStatus }) {
  return useQuery({
    queryKey: ["custom-requests", "list", params],
    queryFn: async () => {
      const res = await axiosInstance.get<ApiListResponse<CustomRequestListItem, PaginationMeta & { totalRequests: number }>>(
        "/custom-requests",
        { params: { page: params.page, status: params.status } },
      );
      return { requests: res.data.data, meta: res.data.meta };
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
  });
}

// GET /custom-requests/:code -> ruang diskusi. Pesan baru dicek tiap 5 detik selama request masih terbuka
export function useCustomRequest(code: string) {
  return useQuery({
    queryKey: customRequestKey(code),
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<CustomRequestDetail>>(`/custom-requests/${code}`);
      return res.data.data;
    },
    enabled: Boolean(code),
    retry: false,
    refetchInterval: (query) => (query.state.data && query.state.data.status !== "DIBATALKAN" ? 5000 : false),
    refetchOnWindowFocus: true,
  });
}

export type CreateCustomRequestVariables = {
  productId?: string;
  size: string;
  colors: string;
  flowers: string;
  cardMessage?: string;
  notes?: string;
  budget?: string;
  neededBy: string;
  images: File[];
};

// POST /custom-requests (multipart: brief + foto referensi)
export function useCreateCustomRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ images, ...fields }: CreateCustomRequestVariables) => {
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => value && formData.append(key, value));
      images.forEach((file) => formData.append("images", file));
      const res = await axiosInstance.post<ApiResponse<CustomRequestDetail>>("/custom-requests", formData);
      return res.data.data;
    },
    onSuccess: (request) => {
      queryClient.setQueryData(customRequestKey(request.code), request);
      return queryClient.invalidateQueries({ queryKey: ["custom-requests", "list"] });
    },
  });
}

// semua aksi di ruang diskusi dibalas detail terbaru -> ganti cache
function useRequestAction<TVariables>(code: string, request: (variables: TVariables) => Promise<CustomRequestDetail>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: (detail) => {
      queryClient.setQueryData(customRequestKey(code), detail);
      return queryClient.invalidateQueries({ queryKey: ["custom-requests", "list"] });
    },
    onError: () => queryClient.invalidateQueries({ queryKey: customRequestKey(code) }),
  });
}

// POST /custom-requests/:code/messages (teks + maks 3 gambar)
export function useSendMessage(code: string) {
  return useRequestAction(code, async ({ body, attachments }: { body: string; attachments: File[] }) => {
    const formData = new FormData();
    if (body.trim()) formData.append("body", body.trim());
    attachments.forEach((file) => formData.append("attachments", file));
    const res = await axiosInstance.post<ApiResponse<CustomRequestDetail>>(`/custom-requests/${code}/messages`, formData);
    return res.data.data;
  });
}

export function useRejectQuotation(code: string) {
  return useRequestAction(code, async (quotationId: string) => {
    const res = await axiosInstance.post<ApiResponse<CustomRequestDetail>>(`/custom-requests/${code}/quotations/${quotationId}/reject`);
    return res.data.data;
  });
}

export function useCancelCustomRequest(code: string) {
  return useRequestAction(code, async () => {
    const res = await axiosInstance.post<ApiResponse<CustomRequestDetail>>(`/custom-requests/${code}/cancel`);
    return res.data.data;
  });
}

export type AcceptQuotationVariables = {
  quotationId: string;
  version: number;
  shippingMethod: ShippingMethod;
  addressId?: string;
  paymentMethod: PaymentMethod;
  expectedTotal: number;
};

// POST /custom-requests/:code/quotations/:id/accept -> pesanan CUSTOM dibuat, lanjut ke halaman bayar
export function useAcceptQuotation(code: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ quotationId, ...body }: AcceptQuotationVariables) => {
      const res = await axiosInstance.post<ApiResponse<OrderDetail>>(`/custom-requests/${code}/quotations/${quotationId}/accept`, body);
      return res.data.data;
    },
    onSuccess: (order) => {
      queryClient.setQueryData(orderQueryKey(order.code), order);
      return queryClient.invalidateQueries({ queryKey: ["custom-requests"] });
    },
    // penawaran berubah / kedaluwarsa -> tampilkan versi terbaru
    onError: () => queryClient.invalidateQueries({ queryKey: customRequestKey(code) }),
  });
}
