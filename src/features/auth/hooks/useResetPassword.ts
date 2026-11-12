import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ResetPasswordInput } from "@/features/validation/authSchema";
import { SESSION_QUERY_KEY } from "./useSession";

// POST /auth/reset-password { token, newPassword, confirmPassword }
// BE mencabut semua sesi (termasuk perangkat ini) -> user harus login ulang
export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: ResetPasswordInput & { token: string }) => {
      await axiosInstance.post("/auth/reset-password", body);
    },
    onSuccess: () => queryClient.setQueryData(SESSION_QUERY_KEY, null),
  });
}
