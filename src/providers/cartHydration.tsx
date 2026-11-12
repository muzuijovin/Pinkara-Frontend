"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

// muat keranjang dari localStorage SETELAH halaman tampil (store pakai skipHydration).
// useEffect di sini untuk membaca storage browser, bukan untuk fetch data dari API
export default function CartHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return null;
}
