import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { LoginInput } from "@/features/validation/authSchema";
import { fetchSession, SESSION_QUERY_KEY } from "./useSession";

// POST /auth/login -> BE set cookie accessToken & refreshToken.
// Respons login hanya berisi data ringkas (tanpa emailVerifiedAt / avatarUrl), jadi setelah cookie terpasang
// data lengkap diambil dari GET /auth/me. Kalau tidak, banner "email belum diverifikasi" & avatar inisial
// muncul sampai halaman di-refresh
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: LoginInput) => {
      await axiosInstance.post<ApiResponse<unknown>>("/auth/login", body);
      return fetchSession();
    },
    // langsung isi cache session -> navbar & GuestOnly ikut berubah tanpa fetch ulang
    onSuccess: (user) => queryClient.setQueryData(SESSION_QUERY_KEY, user),
  });
}
