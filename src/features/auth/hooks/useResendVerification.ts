import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";

// POST /auth/resend-verification (wajib login). BE membatasi jeda 60 detik & 5x per jam
export function useResendVerification() {
  return useMutation({
    mutationFn: async () => {
      await axiosInstance.post("/auth/resend-verification");
    },
  });
}
