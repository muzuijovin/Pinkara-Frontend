import { useQuery } from "@tanstack/react-query";

export type Place = { id: number; name: string; latitude: number; longitude: number };

type NominatimPlace = { place_id: number; display_name: string; lat: string; lon: string };

// cari tempat di peta (jalan, gedung, kelurahan) lewat Nominatim OpenStreetMap — gratis, tanpa API key.
// Aturan Nominatim: maks 1 request/detik & tidak untuk autocomplete -> hanya dicari saat pembeli menekan Search / Enter
export async function searchPlaces(query: string): Promise<Place[]> {
  const params = new URLSearchParams({ format: "jsonv2", countrycodes: "id", limit: "5", "accept-language": "id", q: query });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Couldn't search the map right now. Please try again or move the pin by hand.");
  const rows = (await res.json()) as NominatimPlace[];
  return rows.map((row) => ({ id: row.place_id, name: row.display_name, latitude: Number(row.lat), longitude: Number(row.lon) }));
}

// query kosong = belum mencari. Hasil disimpan lama (tempat tidak berubah) supaya pencarian sama tidak memanggil ulang
export function usePlaceSearch(query: string) {
  return useQuery({
    queryKey: ["map-places", query],
    queryFn: () => searchPlaces(query),
    enabled: query.length > 0,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}
