import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { User } from "@/types/auth.type";
import { SESSION_QUERY_KEY } from "./useSession";

// POST /auth/google { idToken } -> idToken = credential dari tombol Google Identity Services
export function useGoogleLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (idToken: string) => {
      const res = await axiosInstance.post<ApiResponse<User>>("/auth/google", { idToken });
      return res.data.data;
    },
    onSuccess: (user) => queryClient.setQueryData(SESSION_QUERY_KEY, user),
  });
}
