import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { SESSION_QUERY_KEY } from "@/features/auth/hooks/useSession";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { User } from "@/types/auth.type";
import type { Profile } from "@/types/profile.type";
import { normalizePhone, type ProfileInput } from "@/features/validation/profileSchema";

export const PROFILE_QUERY_KEY = ["users", "me"] as const;

// salin data terbaru dari profil ke cache session (/auth/me) yang dipakai navbar & banner verifikasi email,
// supaya tidak ada dua versi data user yang berbeda (mis. profil "Verified" tapi banner masih muncul)
function syncSessionFromProfile(queryClient: QueryClient, profile: Profile) {
  queryClient.setQueryData<User | null | undefined>(SESSION_QUERY_KEY, (session) =>
    session
      ? {
          ...session,
          name: profile.name,
          phone: profile.phone,
          avatarUrl: profile.avatarUrl,
          emailVerifiedAt: profile.emailVerifiedAt,
        }
      : session,
  );
}

// GET /users/me -> data profil lengkap (+ hasPassword / isGoogleLinked)
export function useProfile() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<Profile>>("/users/me");
      const profile = res.data.data;
      syncSessionFromProfile(queryClient, profile);
      return profile;
    },
  });
}

// profil berubah -> cache profil & session (navbar: nama + foto) ikut diperbarui tanpa fetch ulang
function syncProfileCache(queryClient: QueryClient, profile: Profile) {
  queryClient.setQueryData(PROFILE_QUERY_KEY, profile);
  syncSessionFromProfile(queryClient, profile);
}

// PATCH /users/me { name, phone } -> phone kosong = dihapus
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, phone }: ProfileInput) => {
      const res = await axiosInstance.patch<ApiResponse<Profile>>("/users/me", {
        name,
        phone: phone ? normalizePhone(phone) : null,
      });
      return res.data.data;
    },
    onSuccess: (profile) => syncProfileCache(queryClient, profile),
  });
}

// PATCH /users/me/avatar (multipart, field "avatar")
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await axiosInstance.patch<ApiResponse<Profile>>("/users/me/avatar", formData);
      return res.data.data;
    },
    onSuccess: (profile) => syncProfileCache(queryClient, profile),
  });
}

// DELETE /users/me/avatar -> kembali ke inisial nama
export function useRemoveAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.delete<ApiResponse<Profile>>("/users/me/avatar");
      return res.data.data;
    },
    onSuccess: (profile) => syncProfileCache(queryClient, profile),
  });
}
