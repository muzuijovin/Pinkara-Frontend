import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { Product, ProductStatus } from "@/types/product.type";
import type { ProductInput } from "@/features/validation/productSchema";
import type { ProductImage } from "../components/productImagesInput";

type UpdateProductVariables = {
  id: string;
  // versi produk saat form dibuka (optimistic locking, PRD §12.1c)
  version: number;
  values: ProductInput;
  images: ProductImage[];
  status: ProductStatus;
  // stok varian lama saat form dibuka -> dikirim sebagai selisih (stockDelta), bukan ditimpa
  originalStock: Record<string, number>;
};

// form -> multipart/form-data sesuai productsUpdateSchema BE.
// Tipe produk (READY/CUSTOM) tidak bisa diubah, jadi tidak dikirim
function toFormData({ version, values, images, status, originalStock }: UpdateProductVariables) {
  const formData = new FormData();
  formData.append("version", String(version));
  formData.append("name", values.name);
  formData.append("categoryId", values.categoryId);
  formData.append("description", values.description);
  formData.append("status", status);
  formData.append("isFeatured", String(values.isFeatured));
  // string kosong tetap dikirim supaya admin bisa mengosongkan dimensi / bahan
  formData.append("dimensions", values.dimensions);
  formData.append("materials", values.materials);
  if (values.productionDays) formData.append("productionDays", values.productionDays);
  formData.append("allowedAddonTypes", JSON.stringify(values.allowedAddonTypes));

  if (values.type === "READY") {
    const variants = values.variants.map((variant) => {
      const base = {
        label: variant.label,
        price: Number(variant.price),
        sku: variant.sku || null,
        packageSize: variant.packageSize || null,
        isActive: variant.isActive,
      };
      // varian lama: stok disesuaikan +/- (aman walau ada checkout bersamaan), varian baru: stok awal
      return variant.variantId
        ? { ...base, id: variant.variantId, stockDelta: Number(variant.stock) - (originalStock[variant.variantId] ?? 0) }
        : { ...base, stock: Number(variant.stock) };
    });
    formData.append("variants", JSON.stringify(variants));
  } else {
    formData.append("basePrice", values.basePrice);
  }

  // foto lama yang dipertahankan (urutan dari admin), foto baru diupload & ditaruh BE di belakangnya
  const existingImages = images.filter((image) => !image.file).map((image) => image.url);
  formData.append("existingImages", JSON.stringify(existingImages));
  images.forEach((image) => image.file && formData.append("images", image.file));

  return formData;
}

// PUT /products/:id (khusus ADMIN). 409 = produk sudah diubah admin lain / stok berubah karena ada pesanan
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: UpdateProductVariables) => {
      const res = await axiosInstance.put<ApiResponse<Product>>(`/products/${variables.id}`, toFormData(variables));
      return res.data.data;
    },
    // daftar admin, detail admin & katalog publik diambil ulang
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}
