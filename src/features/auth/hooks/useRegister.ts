import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { User } from "@/types/auth.type";
import type { RegisterInput } from "@/features/validation/authSchema";

// POST /auth/register -> akun CUSTOMER dibuat + email verifikasi dikirim.
// BE tidak langsung login-kan user, jadi setelah ini user diarahkan cek email lalu masuk.
export function useRegister() {
  return useMutation({
    mutationFn: async ({ name, email, password }: RegisterInput) => {
      const res = await axiosInstance.post<ApiResponse<User>>("/auth/register", {
        name,
        email,
        password,
      });
      return res.data;
    },
  });
}
