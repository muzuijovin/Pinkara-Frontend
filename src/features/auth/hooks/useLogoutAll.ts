import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios-instance.lib";
import { SESSION_QUERY_KEY } from "./useSession";

// POST /auth/logout-all -> semua sesi (semua perangkat) dicabut, termasuk perangkat ini
export function useLogoutAll() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.post("/auth/logout-all");
    },
    // sama seperti useLogout: session di-set null (bukan clear) supaya navbar langsung berubah
    onSuccess: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== SESSION_QUERY_KEY[0] });
      router.replace("/login");
    },
  });
}
