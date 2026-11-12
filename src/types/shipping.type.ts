// GET /shipping/rates: pilihan kurir untuk alamat terpilih (tarif dari Biteship, diurutkan instan dulu)
export type ShippingRateType = "INSTANT" | "SAME_DAY" | "REGULAR";

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
