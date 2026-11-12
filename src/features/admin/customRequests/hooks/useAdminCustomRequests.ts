import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiListResponse, ApiResponse, PaginationMeta } from "@/types/api-response.type";
import type { AddonOption, CustomRequestDetail, CustomRequestListItem, CustomRequestStatus } from "@/types/customRequest.type";

const detailKey = (code: string) => ["admin", "custom-requests", code] as const;

export type AdminCustomRequestsParams = { page: number; status?: CustomRequestStatus; search?: string };

// GET /admin/custom-requests -> inbox diskusi + jumlah per status
export function useAdminCustomRequests(params: AdminCustomRequestsParams) {
  return useQuery({
    queryKey: ["admin", "custom-requests", "list", params],
    queryFn: async () => {
      const res = await axiosInstance.get<
        ApiListResponse<CustomRequestListItem, PaginationMeta & { totalRequests: number; statusCounts: Partial<Record<CustomRequestStatus, number>> }>
      >("/admin/custom-requests", { params: { page: params.page, status: params.status, search: params.search || undefined } });
      return { requests: res.data.data, meta: res.data.meta };
    },
    placeholderData: keepPreviousData,
    // pesan baru dari pembeli bisa masuk kapan saja
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

// GET /admin/custom-requests/:code -> chat dicek tiap 5 detik
export function useAdminCustomRequest(code: string) {
  return useQuery({
    queryKey: detailKey(code),
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<CustomRequestDetail>>(`/admin/custom-requests/${code}`);
      return res.data.data;
    },
    enabled: Boolean(code),
    retry: false,
    refetchInterval: (query) => (query.state.data && query.state.data.status !== "DIBATALKAN" ? 5000 : false),
    refetchOnWindowFocus: true,
  });
}

// GET /addons -> pilihan add-on untuk penawaran
export function useAddonOptions() {
  return useQuery({
    queryKey: ["addons"],
    queryFn: async () => (await axiosInstance.get<ApiResponse<AddonOption[]>>("/addons")).data.data,
    staleTime: 5 * 60 * 1000,
  });
}

function useAction<TVariables>(code: string, request: (variables: TVariables) => Promise<CustomRequestDetail>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: (detail) => {
      queryClient.setQueryData(detailKey(code), detail);
      return queryClient.invalidateQueries({ queryKey: ["admin", "custom-requests", "list"] });
    },
    onError: () => queryClient.invalidateQueries({ queryKey: detailKey(code) }),
  });
}

export function useAdminSendMessage(code: string) {
  return useAction(code, async ({ body, attachments }: { body: string; attachments: File[] }) => {
    const formData = new FormData();
    if (body.trim()) formData.append("body", body.trim());
    attachments.forEach((file) => formData.append("attachments", file));
    return (await axiosInstance.post<ApiResponse<CustomRequestDetail>>(`/admin/custom-requests/${code}/messages`, formData)).data.data;
  });
}

export type CreateQuotationVariables = {
  items: { name: string; quantity: number; unitPrice: number; addons: { addonId: string; quantity: number; giftMessage?: string }[] }[];
  readyDate: string;
  notes?: string;
  validHours: number;
};

// POST /admin/custom-requests/:code/quotations (penawaran lama otomatis diganti)
export function useCreateQuotation(code: string) {
  return useAction(code, async (body: CreateQuotationVariables) =>
    (await axiosInstance.post<ApiResponse<CustomRequestDetail>>(`/admin/custom-requests/${code}/quotations`, body)).data.data,
  );
}

export function useWithdrawQuotation(code: string) {
  return useAction(code, async (quotationId: string) =>
    (await axiosInstance.post<ApiResponse<CustomRequestDetail>>(`/admin/custom-requests/${code}/quotations/${quotationId}/withdraw`)).data.data,
  );
}

export function useAdminCancelRequest(code: string) {
  return useAction(code, async (reason: string) =>
    (await axiosInstance.post<ApiResponse<CustomRequestDetail>>(`/admin/custom-requests/${code}/cancel`, { reason })).data.data,
  );
}
