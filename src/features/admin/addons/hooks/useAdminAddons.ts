import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { AdminAddon, StockReason } from "@/types/catalog.type";
import type { AddonInput } from "@/features/validation/catalogSchema";

const ADMIN_ADDONS_KEY = ["admin", "addons"] as const;

// GET /admin/addons -> semua add-on (aktif & nonaktif) + penanda stok menipis
export function useAdminAddons() {
  return useQuery({
    queryKey: ADMIN_ADDONS_KEY,
    queryFn: async () => (await axiosInstance.get<ApiResponse<AdminAddon[]>>("/admin/addons")).data.data,
    refetchOnWindowFocus: true,
  });
}

// perubahan add-on mempengaruhi daftar admin, pilihan add-on penawaran custom, dan detail produk publik
function useAddonMutation<TVariables>(request: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ADMIN_ADDONS_KEY }),
        queryClient.invalidateQueries({ queryKey: ["addons"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]),
  });
}

// multipart: semua value jadi string (BE coerce angka & "true"/"false")
function toFormData(values: Record<string, string | number | boolean | undefined>, image?: File | null) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    formData.append(key, String(value));
  });
  if (image) formData.append("image", image);
  return formData;
}

// POST /admin/addons (multipart, foto opsional)
export function useCreateAddon() {
  return useAddonMutation(async ({ values, image }: { values: AddonInput; image: File | null }) => {
    const { size, ...rest } = values;
    const payload = { ...rest, ...(values.type === "PACKAGING" ? { size } : {}) };
    return (await axiosInstance.post<ApiResponse<AdminAddon>>("/admin/addons", toFormData(payload, image))).data.data;
  });
}

// PATCH /admin/addons/:id (tipe & stok tidak diubah di sini). version = optimistic locking
export function useUpdateAddon() {
  return useAddonMutation(
    async ({ addon, values, image, removeImage }: { addon: AdminAddon; values: AddonInput; image: File | null; removeImage: boolean }) => {
      const payload = {
        version: addon.version,
        name: values.name,
        price: values.price,
        lowStockThreshold: values.lowStockThreshold,
        isActive: values.isActive,
        ...(addon.type === "PACKAGING" ? { size: values.size } : {}),
        ...(removeImage ? { removeImage: true } : {}),
      };
      return (await axiosInstance.patch<ApiResponse<AdminAddon>>(`/admin/addons/${addon.id}`, toFormData(payload, image))).data.data;
    },
  );
}

// POST /admin/addons/:id/stock { delta, reason, note } -> penyesuaian atomik, tidak bisa minus
export function useAdjustAddonStock() {
  return useAddonMutation(async ({ id, delta, reason, note }: { id: string; delta: number; reason: StockReason; note?: string }) =>
    (await axiosInstance.post<ApiResponse<AdminAddon>>(`/admin/addons/${id}/stock`, { delta, reason, note: note || undefined })).data.data,
  );
}

// DELETE /admin/addons/:id (soft delete)
export function useDeleteAddon() {
  return useAddonMutation(async (id: string) => axiosInstance.delete(`/admin/addons/${id}`));
}
