import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { User } from "@/types/auth.type";

export const SESSION_QUERY_KEY = ["auth", "me"] as const;

// data user lengkap (termasuk emailVerifiedAt & avatarUrl) dari GET /auth/me
export async function fetchSession() {
  const res = await axiosInstance.get<ApiResponse<User>>("/auth/me");
  return res.data.data;
}

// GET /auth/me -> user yang sedang login. 401 (setelah coba refresh) = tamu.
// data: User = login, null = baru logout, undefined = belum login / gagal
export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchSession,
    retry: false,
    // tamu (401) jangan di-fetch ulang setiap ada komponen baru yang memakai useSession.
    // Tanpa ini: error -> navbar tamu muncul -> komponen di dalamnya memanggil useSession -> fetch ulang
    // -> status kembali pending -> navbar jadi skeleton -> ... berulang terus (navbar skeleton selamanya)
    retryOnMount: false,
    staleTime: 60 * 1000,
    // ambil ulang saat kembali ke tab ini: status verifikasi email / nama / foto yang diubah
    // di tab atau perangkat lain langsung ikut terbaru (default QueryProvider mematikan ini)
    refetchOnWindowFocus: true,
  });
}
