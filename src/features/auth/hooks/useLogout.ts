import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios-instance.lib";
import { SESSION_QUERY_KEY } from "./useSession";

// POST /auth/logout -> BE cabut refresh token & hapus cookie (httpOnly, FE tidak bisa hapus sendiri)
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.post("/auth/logout");
    },
    // onSettled: walau request gagal, tampilan tetap dikembalikan ke tamu
    onSettled: () => {
      // session di-set null (bukan dihapus) supaya navbar yang sedang memantau query ini
      // langsung berubah ke versi tamu. Jangan pakai queryClient.clear(): query session ikut
      // terhapus dan navbar tidak dapat update -> tombol Keluar terlihat tidak berfungsi
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      // data milik user lain (pesanan, keranjang, dll.) dibuang supaya tidak terlihat user berikutnya
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== SESSION_QUERY_KEY[0] });
      router.replace("/");
    },
  });
}
