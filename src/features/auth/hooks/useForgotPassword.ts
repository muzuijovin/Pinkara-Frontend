import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ForgotPasswordInput } from "@/features/validation/authSchema";

// POST /auth/forgot-password -> BE selalu balas sukses (supaya email terdaftar tidak bisa ditebak)
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (body: ForgotPasswordInput) => {
      await axiosInstance.post("/auth/forgot-password", body);
    },
  });
}
