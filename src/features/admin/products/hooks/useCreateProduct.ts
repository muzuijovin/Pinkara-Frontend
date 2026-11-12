import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { Product, ProductStatus } from "@/types/product.type";
import type { ProductInput } from "@/features/validation/productSchema";

type CreateProductVariables = {
  values: ProductInput;
  images: File[]; // urutan = urutan tampil, index 0 = cover
  status: Extract<ProductStatus, "DRAFT" | "ACTIVE">;
};

// form -> multipart/form-data sesuai productsCreateSchema BE:
// angka dikirim sebagai string (BE coerce), array/objek sebagai JSON string
function toFormData({ values, images, status }: CreateProductVariables) {
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("categoryId", values.categoryId);
  formData.append("type", values.type);
  formData.append("description", values.description);
  formData.append("status", status);
  formData.append("isFeatured", String(values.isFeatured));
  if (values.dimensions) formData.append("dimensions", values.dimensions);
  if (values.materials) formData.append("materials", values.materials);
  if (values.productionDays) formData.append("productionDays", values.productionDays);

  if (values.type === "READY") {
    const variants = values.variants.map((variant) => ({
      label: variant.label,
      price: Number(variant.price),
      stock: Number(variant.stock),
      sku: variant.sku || null,
      packageSize: variant.packageSize || null,
    }));
    formData.append("variants", JSON.stringify(variants));
  } else {
    formData.append("basePrice", values.basePrice);
  }

  // tidak dikirim = BE pakai add-on default kategori
  if (!values.useCategoryAddons) {
    formData.append("allowedAddonTypes", JSON.stringify(values.allowedAddonTypes));
  }

  images.forEach((file) => formData.append("images", file));
  return formData;
}

// POST /products (khusus ADMIN). Foto diupload BE ke Cloudinary dalam request yang sama
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: CreateProductVariables) => {
      const res = await axiosInstance.post<ApiResponse<Product>>("/products", toFormData(variables));
      return res.data.data;
    },
    // daftar produk admin & katalog publik perlu diambil ulang
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}
