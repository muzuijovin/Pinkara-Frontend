import type { Metadata } from "next";
import { CategoryManager } from "@/features/admin/categories/categoryManager";

export const metadata: Metadata = { title: "Categories | Pinkara Admin" };

// kelola kategori bunga (PRD §12). Akses ADMIN dijaga RequireAuth di admin/layout.tsx
export default function AdminCategoriesPage() {
  return <CategoryManager />;
}
