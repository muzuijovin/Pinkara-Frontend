import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { NotificationPage } from "@/types/notification.type";

const UNREAD_KEY = ["notifications", "unread-count"] as const;
const LIST_KEY = ["notifications", "list"] as const;
const PAGE_SIZE = 10;

// angka di lonceng: dicek ulang tiap 30 detik saat tab aktif & saat kembali ke tab
export function useUnreadCount() {
  return useQuery({
    queryKey: UNREAD_KEY,
    queryFn: async () => (await axiosInstance.get<ApiResponse<{ unreadCount: number }>>("/notifications/unread-count")).data.data.unreadCount,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

// daftar di dropdown lonceng, "Load more" pakai cursor createdAt notifikasi terakhir.
// Hanya diambil saat dropdown dibuka (enabled)
export function useNotificationList(enabled: boolean) {
  const queryClient = useQueryClient();
  return useInfiniteQuery({
    queryKey: LIST_KEY,
    enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await axiosInstance.get<ApiResponse<NotificationPage>>("/notifications", { params: { limit: PAGE_SIZE, before: pageParam } });
      // angka lonceng ikut diperbarui dari response daftar
      queryClient.setQueryData(UNREAD_KEY, res.data.data.unreadCount);
      return res.data.data;
    },
    getNextPageParam: (last) => (last.hasMore ? last.notifications.at(-1)?.createdAt : undefined),
    staleTime: 0,
  });
}

// tandai di cache dulu supaya titik "belum dibaca" langsung hilang (optimistic)
function markInCache(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  queryClient.setQueryData<InfiniteData<NotificationPage>>(LIST_KEY, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((item) => (!id || item.id === id ? { ...item, isRead: true } : item)),
          })),
        }
      : data,
  );
}

// PATCH /notifications/:id/read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await axiosInstance.patch<ApiResponse<{ unreadCount: number }>>(`/notifications/${id}/read`)).data.data.unreadCount,
    onMutate: (id) => {
      markInCache(queryClient, id);
      queryClient.setQueryData<number>(UNREAD_KEY, (count) => Math.max(0, (count ?? 1) - 1));
    },
    onSuccess: (unreadCount) => queryClient.setQueryData(UNREAD_KEY, unreadCount),
    onError: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// PATCH /notifications/read-all
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => axiosInstance.patch("/notifications/read-all"),
    onMutate: () => {
      markInCache(queryClient);
      queryClient.setQueryData(UNREAD_KEY, 0);
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
