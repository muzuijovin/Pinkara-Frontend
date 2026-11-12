"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useEffect } from "react";

export type LatLng = { latitude: number; longitude: number };

// pusat Kota Malang: posisi awal peta kalau alamat belum punya titik
export const MALANG_CENTER: LatLng = { latitude: -7.9826, longitude: 112.6308 };

// pin SVG sendiri (ikon PNG bawaan Leaflet sering rusak saat dibundel)
const pinIcon = L.divIcon({
  className: "",
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  html: `<svg width="32" height="40" viewBox="0 0 32 40" aria-hidden="true"><path d="M16 0C7.2 0 0 7 0 15.7 0 27.5 16 40 16 40s16-12.5 16-24.3C32 7 24.8 0 16 0z" fill="#c41d7f"/><circle cx="16" cy="15.5" r="6" fill="#fff"/></svg>`,
});

// klik peta -> pindahkan pin
function ClickToPin({ onPick }: { onPick: (value: LatLng) => void }) {
  useMapEvents({ click: (event) => onPick({ latitude: event.latlng.lat, longitude: event.latlng.lng }) });
  return null;
}

// titik berubah dari luar (mis. "Use my current location") -> peta ikut bergeser
function FollowPin({ value }: { value: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (value) map.setView([value.latitude, value.longitude], Math.max(map.getZoom(), 16));
  }, [map, value]);
  return null;
}

// peta Leaflet + OpenStreetMap (gratis, tanpa API key). Hanya jalan di browser -> di-load lewat next/dynamic
export default function LocationMap({ value, onChange }: { value: LatLng | null; onChange: (value: LatLng) => void }) {
  const center = value ?? MALANG_CENTER;
  return (
    <MapContainer center={[center.latitude, center.longitude]} zoom={value ? 16 : 13} scrollWheelZoom={false} className="size-full">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickToPin onPick={onChange} />
      <FollowPin value={value} />
      {value && (
        <Marker
          position={[value.latitude, value.longitude]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const { lat, lng } = (event.target as L.Marker).getLatLng();
              onChange({ latitude: lat, longitude: lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
