import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiListResponse, ApiResponse } from "@/types/api-response.type";
import type { AdminPayment, AdminPaymentDetail, AdminPaymentsMeta, AdminPaymentsParams, PaymentCheckResult } from "@/types/adminPayment.type";

const paymentKey = (id: string) => ["admin", "payments", id] as const;

// GET /admin/payments -> daftar tagihan + jumlah per status + jumlah "perlu perhatian"
export function useAdminPayments(params: AdminPaymentsParams) {
  return useQuery({
    queryKey: ["admin", "payments", "list", params],
    queryFn: async () => {
      const res = await axiosInstance.get<ApiListResponse<AdminPayment, AdminPaymentsMeta>>("/admin/payments", {
        params: { ...params, search: params.search || undefined, attention: params.attention ? "true" : undefined },
      });
      return { payments: res.data.data, meta: res.data.meta };
    },
    placeholderData: keepPreviousData,
    // pembayaran masuk otomatis dari Midtrans -> daftar diperbarui saat kembali ke tab
    refetchOnWindowFocus: true,
  });
}

// GET /admin/payments/:id -> detail + riwayat event webhook
export function useAdminPayment(id: string | null) {
  return useQuery({
    queryKey: paymentKey(id ?? ""),
    queryFn: async () => (await axiosInstance.get<ApiResponse<AdminPaymentDetail>>(`/admin/payments/${id}`)).data.data,
    enabled: Boolean(id),
  });
}

// POST /admin/payments/:id/check -> tanya status langsung ke Midtrans
export function useCheckPaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await axiosInstance.post<ApiResponse<PaymentCheckResult>>(`/admin/payments/${id}/check`)).data.data,
    onSuccess: (result) => {
      queryClient.setQueryData(paymentKey(result.payment.id), result.payment);
      if (result.changed) {
        // status berubah -> daftar, pesanan, dashboard, audit log ikut diperbarui
        return Promise.all(
          [["admin", "payments", "list"], ["admin", "orders"], ["admin", "dashboard"], ["admin", "audit-logs"]].map((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
          ),
        );
      }
    },
  });
}
