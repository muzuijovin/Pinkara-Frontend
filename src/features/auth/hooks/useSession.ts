import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { User } from "@/types/auth.type";

export const SESSION_QUERY_KEY = ["auth", "me"] as const;

// GET /auth/me -> user yang sedang login. 401 (setelah coba refresh) = tamu.
// data: User = login, null = baru logout, undefined = belum login / gagal
export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<User>>("/auth/me");
      return res.data.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
