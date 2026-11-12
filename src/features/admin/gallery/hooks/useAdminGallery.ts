import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { AdminGalleryItem } from "@/types/gallery.type";
import type { GalleryInput } from "@/features/validation/gallerySchema";

const ADMIN_GALLERY_KEY = ["admin", "gallery"] as const;

// GET /admin/gallery -> semua foto (tampil & tersembunyi) sesuai urutan di landing
export function useAdminGallery() {
  return useQuery({
    queryKey: ADMIN_GALLERY_KEY,
    queryFn: async () => (await axiosInstance.get<ApiResponse<AdminGalleryItem[]>>("/admin/gallery")).data.data,
  });
}

// setiap perubahan: daftar admin, galeri landing, dan audit log diambil ulang
function useGalleryMutation<TVariables, TData>(request: (variables: TVariables) => Promise<TData>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ADMIN_GALLERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ["gallery"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] }),
      ]),
  });
}

type SaveVariables = { id?: string; values: GalleryInput; image: File | null };

// POST /admin/gallery (foto wajib) atau PATCH /admin/gallery/:id (foto opsional = ganti foto)
export function useSaveGalleryItem() {
  return useGalleryMutation(async ({ id, values, image }: SaveVariables) => {
    const body = new FormData();
    body.append("caption", values.caption);
    body.append("isActive", String(values.isActive));
    if (image) body.append("image", image);
    const res = id
      ? await axiosInstance.patch<ApiResponse<AdminGalleryItem>>(`/admin/gallery/${id}`, body)
      : await axiosInstance.post<ApiResponse<AdminGalleryItem>>("/admin/gallery", body);
    return res.data.data;
  });
}

// PATCH /admin/gallery/:id { isActive } -> tampil / sembunyikan cepat dari kartu
export function useToggleGalleryItem() {
  return useGalleryMutation(async ({ id, isActive }: { id: string; isActive: boolean }) =>
    (await axiosInstance.patch<ApiResponse<AdminGalleryItem>>(`/admin/gallery/${id}`, { isActive })).data.data,
  );
}

// PATCH /admin/gallery/reorder { ids }
export function useReorderGallery() {
  return useGalleryMutation(async (ids: string[]) => (await axiosInstance.patch<ApiResponse<AdminGalleryItem[]>>("/admin/gallery/reorder", { ids })).data.data);
}

// DELETE /admin/gallery/:id (permanen, foto di Cloudinary ikut dihapus)
export function useDeleteGalleryItem() {
  return useGalleryMutation(async (id: string) => axiosInstance.delete(`/admin/gallery/${id}`));
}
