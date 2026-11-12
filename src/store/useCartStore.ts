import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProductSize, ProductType } from "@/types/product.type";

// Keranjang lokal (PRD §3: tamu boleh menambah ke keranjang, disimpan di browser).
// Setelah login & API keranjang siap, isi keranjang ini digabung ke keranjang akun (PRD §5).
// Harga di sini hanya untuk tampilan — harga & stok final selalu dicek ulang server saat checkout (PRD §6.3).

export type CartItemAddons = {
  packaging?: { addonId: string; name: string; size: ProductSize; price: number }; // 1 per unit produk
  paperBag?: { addonId: string; price: number; quantity: number };
  giftCard?: { addonId: string; price: number; message: string; senderName: string; anonymous: boolean };
};

export type CartItem = {
  id: string; // id baris keranjang (lokal)
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  type: ProductType;
  variantId: string;
  variantLabel: string;
  unitPrice: number;
  maxQuantity: number; // stok varian saat ditambahkan
  quantity: number;
  addons: CartItemAddons;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

// add-on menempel per baris (PRD §4.4): produk sama TANPA add-on digabung jumlahnya,
// yang pakai add-on (mis. gift card dengan pesan berbeda) selalu jadi baris sendiri
const hasAddons = (addons: CartItemAddons) => Boolean(addons.packaging || addons.paperBag || addons.giftCard);

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = !hasAddons(item.addons)
            ? state.items.find((line) => line.variantId === item.variantId && !hasAddons(line.addons))
            : undefined;

          if (existing) {
            return {
              items: state.items.map((line) =>
                line.id === existing.id
                  ? { ...line, quantity: Math.min(line.quantity + item.quantity, item.maxQuantity), maxQuantity: item.maxQuantity, unitPrice: item.unitPrice }
                  : line,
              ),
            };
          }
          return { items: [...state.items, { ...item, id: crypto.randomUUID() }] };
        }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((line) => line.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "pinkara-cart",
      storage: createJSONStorage(() => localStorage),
      // dibaca dari localStorage setelah halaman tampil (lihat providers/cartHydration.tsx)
      // supaya HTML server & render pertama browser sama (tidak ada hydration mismatch)
      skipHydration: true,
    },
  ),
);

// jumlah unit di keranjang (badge ikon keranjang)
export const selectCartCount = (state: CartStore) => state.items.reduce((total, line) => total + line.quantity, 0);
