// GET /shipping/rates: pilihan kurir untuk alamat terpilih (tarif dari Biteship, diurutkan instan dulu)
// EXPRESS = besok sampai (JNE YES)
export type ShippingRateType = "INSTANT" | "SAME_DAY" | "REGULAR" | "EXPRESS";

export type ShippingOption = {
  id: string; // "gojek:instant"
  courierCode: string;
  serviceCode: string;
  courierName: string;
  serviceName: string; // "GoSend Instant"
  type: ShippingRateType;
  eta: string;
  fee: number;
  isFallback: boolean; // tarif flat cadangan saat Biteship tidak bisa dihubungi
};

export type ShippingRates = {
  options: ShippingOption[];
  fallback: boolean;
  hasPin: boolean; // alamat punya titik lokasi -> kurir instan bisa muncul
};

// GET /shipping/areas: wilayah resmi (kecamatan) untuk form alamat
export type Area = {
  id: string;
  name: string; // "Klojen, Malang, Jawa Timur. 65111"
  province: string;
  city: string;
  district: string;
  postalCode: string;
};
