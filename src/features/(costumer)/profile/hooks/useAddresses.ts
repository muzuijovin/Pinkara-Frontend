import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { Address } from "@/types/profile.type";
import { normalizePhone, type AddressInput } from "@/features/validation/profileSchema";

export const ADDRESSES_QUERY_KEY = ["addresses"] as const;

const toPayload = ({ label, recipientPhone, ...rest }: AddressInput) => ({
  ...rest,
  label: label || null,
  recipientPhone: normalizePhone(recipientPhone),
});

// GET /addresses -> alamat utama selalu paling atas (diurutkan BE)
export function useAddresses() {
  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<Address[]>>("/addresses");
      return res.data.data;
    },
  });
}

// semua perubahan alamat bisa menggeser alamat utama -> ambil ulang daftar lengkap dari BE
function useAddressMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY }),
  });
}

// POST /addresses (alamat pertama otomatis jadi utama)
export function useCreateAddress() {
  return useAddressMutation((input: AddressInput) => axiosInstance.post("/addresses", toPayload(input)));
}

// PATCH /addresses/:id
export function useUpdateAddress() {
  return useAddressMutation(({ id, input }: { id: string; input: AddressInput }) =>
    axiosInstance.patch(`/addresses/${id}`, toPayload(input)),
  );
}

// PATCH /addresses/:id/default
export function useSetDefaultAddress() {
  return useAddressMutation((id: string) => axiosInstance.patch(`/addresses/${id}/default`));
}

// DELETE /addresses/:id (soft delete; alamat utama dihapus -> alamat terbaru jadi utama)
export function useDeleteAddress() {
  return useAddressMutation((id: string) => axiosInstance.delete(`/addresses/${id}`));
}
