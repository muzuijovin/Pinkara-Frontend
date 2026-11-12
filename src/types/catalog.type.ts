import type { AddonType, ProductSize } from "./product.type";

// GET /admin/addons
export type AdminAddon = {
  id: string;
  name: string;
  type: AddonType;
  size: ProductSize | null; // khusus kardus
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  lowStockThreshold: number;
  isLowStock: boolean; // stok <= ambang
  version: number; // optimistic locking saat edit
  updatedAt: string;
};

export type StockReason = "RESTOCK" | "DAMAGED" | "CORRECTION";

// GET /admin/categories
export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  defaultAddonTypes: AddonType[];
  productCount: number; // semua produk yang belum dihapus (termasuk draft)
  updatedAt: string;
};
