import type { Address } from "@/types/profile.type";

// alamat siap dipakai kirim: wilayah resmi + pin (sama dengan isAddressComplete di BE).
// Alamat lama sebelum validasi wilayah harus diperbarui dulu di Profil
export const isAddressReady = (address: Pick<Address, "areaId" | "latitude" | "longitude">) =>
  Boolean(address.areaId) && address.latitude !== null && address.longitude !== null;

// "Jl. Ijen 10, Klojen, Malang, Jawa Timur. 65111" (alamat lama: kota + kode pos)
export const formatAddressLine = (address: Pick<Address, "fullAddress" | "areaName" | "city" | "postalCode">) =>
  `${address.fullAddress}, ${address.areaName ?? `${address.city} ${address.postalCode}`}`;

// alamat terpilih di checkout: pilihan pembeli (kalau masih ada & siap), lalu alamat utama yang siap, lalu yang siap pertama
export function pickReadyAddress(addresses: Address[] | undefined, pickedId: string | null) {
  const ready = addresses?.filter(isAddressReady) ?? [];
  return (ready.find((address) => address.id === pickedId) ?? ready.find((address) => address.isDefault) ?? ready[0])?.id ?? null;
}
