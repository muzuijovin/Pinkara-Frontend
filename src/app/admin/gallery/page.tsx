import type { Metadata } from "next";
import { GalleryManager } from "@/features/admin/gallery/galleryManager";

export const metadata: Metadata = { title: "Gallery | Pinkara Admin" };

// kelola galeri hasil karya untuk landing (PRD §6.1, §12). Akses ADMIN dijaga RequireAuth di admin/layout.tsx
export default function AdminGalleryPage() {
  return <GalleryManager />;
}
