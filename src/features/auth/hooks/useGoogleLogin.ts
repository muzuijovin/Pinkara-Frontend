import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import { fetchSession, SESSION_QUERY_KEY } from "./useSession";

// POST /auth/google { idToken } -> idToken = credential dari tombol Google Identity Services.
// Sama seperti login email: data user lengkap diambil dari GET /auth/me setelah cookie terpasang
export function useGoogleLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (idToken: string) => {
      await axiosInstance.post<ApiResponse<unknown>>("/auth/google", { idToken });
      return fetchSession();
    },
    onSuccess: (user) => queryClient.setQueryData(SESSION_QUERY_KEY, user),
  });
}
