import type { User } from "./auth.type";

// GET /users/me: data user + info metode login
export type Profile = User & {
  hasPassword: boolean; // false = akun Google-only (belum pernah buat password)
  isGoogleLinked: boolean;
};

// GET /addresses
export type Address = {
  id: string;
  label: string | null;
  recipientName: string;
  recipientPhone: string;
  fullAddress: string;
  city: string;
  postalCode: string;
  latitude: number | null; // titik lokasi (untuk kurir instan)
  longitude: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};
