import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import { SESSION_QUERY_KEY } from "./useSession";

// POST /auth/verify-email { token } -> token dari link email (/verify-email?token=...)
export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      await axiosInstance.post("/auth/verify-email", { token });
    },
    // kalau user sedang login, emailVerifiedAt di session perlu diperbarui
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY }),
  });
}
