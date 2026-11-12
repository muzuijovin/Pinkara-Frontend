// foto galeri di panel admin (GET /admin/gallery): termasuk yang disembunyikan
export type AdminGalleryItem = {
  id: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};
