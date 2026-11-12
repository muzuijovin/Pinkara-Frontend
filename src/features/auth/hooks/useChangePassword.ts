import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ChangePasswordInput } from "@/features/validation/authSchema";

// PATCH /auth/change-password (wajib login). Perangkat lain ter-logout,
// perangkat ini dapat cookie sesi baru dari BE -> tidak perlu login ulang
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, ...body }: ChangePasswordInput) => {
      await axiosInstance.patch("/auth/change-password", {
        ...body,
        // akun Google-only boleh tanpa password lama
        currentPassword: currentPassword || undefined,
      });
    },
  });
}
