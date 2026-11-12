import type { Metadata } from "next";
import { ProductForm } from "@/features/admin/products/productForm";

export const metadata: Metadata = { title: "Add Product | Pinkara Admin" };

// upload produk baru (PRD §12.1b). Akses ADMIN dijaga RequireAuth di admin/layout.tsx
export default function AdminCreateProductPage() {
  return <ProductForm />;
}
