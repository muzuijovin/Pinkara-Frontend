// GET /categories (kategori aktif, urut sortOrder)
export type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  _count: { products: number }; // jumlah produk aktif di kategori ini
};
