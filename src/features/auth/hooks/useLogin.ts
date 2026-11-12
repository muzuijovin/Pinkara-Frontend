import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { User } from "@/types/auth.type";
import type { LoginInput } from "@/features/validation/authSchema";
import { SESSION_QUERY_KEY } from "./useSession";

// POST /auth/login -> BE set cookie accessToken & refreshToken, balikin data user
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: LoginInput) => {
      const res = await axiosInstance.post<ApiResponse<User>>("/auth/login", body);
      return res.data.data;
    },
    // langsung isi cache session -> navbar & GuestOnly ikut berubah tanpa fetch ulang
    onSuccess: (user) => queryClient.setQueryData(SESSION_QUERY_KEY, user),
  });
}
