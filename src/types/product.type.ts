export type ProductType = "READY" | "CUSTOM";
export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE";
export type ProductSize = "S" | "M" | "L" | "XL";
export type AddonType = "PACKAGING" | "PAPER_BAG" | "GIFT_CARD";

export type ProductVariant = {
  id: string;
  label: string;
  price: number;
  stock: number;
  sku: string | null;
  packageSize: ProductSize | null;
  sortOrder: number;
};

// 1 baris di GET /products/admin (daftar produk panel admin)
export type AdminProductListItem = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  status: ProductStatus;
  images: string[];
  minPrice: number;
  maxPrice: number;
  isFeatured: boolean;
  updatedAt: string;
  deletedAt: string | null;
  category: { name: string; slug: string };
  totalStock: number | null; // null = produk CUSTOM (tidak pakai stok)
};

// response POST /products (produk + varian)
export type Product = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  type: ProductType;
  status: ProductStatus;
  description: string;
  basePrice: number | null;
  minPrice: number;
  maxPrice: number;
  images: string[];
  isFeatured: boolean;
  dimensions: string | null;
  materials: string | null;
  productionDays: number | null;
  allowedAddonTypes: AddonType[];
  version: number;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
};
