import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { AdminCategory } from "@/types/catalog.type";
import type { CategoryInput } from "@/features/validation/catalogSchema";

const ADMIN_CATEGORIES_KEY = ["admin", "categories"] as const;

// GET /admin/categories -> semua kategori (aktif & nonaktif) + jumlah produk
export function useAdminCategories() {
  return useQuery({
    queryKey: ADMIN_CATEGORIES_KEY,
    queryFn: async () => (await axiosInstance.get<ApiResponse<AdminCategory[]>>("/admin/categories")).data.data,
  });
}

// kategori dipakai navbar, filter katalog, landing, dan form produk -> semua diambil ulang
function useCategoryMutation<TVariables>(request: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_KEY }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
      ]),
  });
}

function toFormData(values: CategoryInput, image: File | null, removeImage: boolean) {
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("isActive", String(values.isActive));
  formData.append("defaultAddonTypes", JSON.stringify(values.defaultAddonTypes));
  if (image) formData.append("image", image);
  if (removeImage) formData.append("removeImage", "true");
  return formData;
}

type SaveVariables = { id?: string; values: CategoryInput; image: File | null; removeImage: boolean };

// POST /admin/categories atau PATCH /admin/categories/:id (multipart, foto opsional)
export function useSaveCategory() {
  return useCategoryMutation(async ({ id, values, image, removeImage }: SaveVariables) => {
    const body = toFormData(values, image, removeImage);
    const res = id
      ? await axiosInstance.patch<ApiResponse<AdminCategory>>(`/admin/categories/${id}`, body)
      : await axiosInstance.post<ApiResponse<AdminCategory>>("/admin/categories", body);
    return res.data.data;
  });
}

// PATCH /admin/categories/reorder { ids } -> urutan di landing & filter katalog
export function useReorderCategories() {
  return useCategoryMutation(async (ids: string[]) => (await axiosInstance.patch<ApiResponse<AdminCategory[]>>("/admin/categories/reorder", { ids })).data.data);
}

// DELETE /admin/categories/:id (ditolak BE kalau masih ada produk)
export function useDeleteCategory() {
  return useCategoryMutation(async (id: string) => axiosInstance.delete(`/admin/categories/${id}`));
}
