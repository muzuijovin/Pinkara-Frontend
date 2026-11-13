"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { PiCrosshair, PiMapPin, PiX } from "react-icons/pi";
import type { LatLng } from "./locationMap";

// Leaflet butuh window -> hanya di-render di browser
const LocationMap = dynamic(() => import("./locationMap"), {
  ssr: false,
  loading: () => <div className="skeleton size-full" />,
});

const round = (value: number) => Math.round(value * 1e6) / 1e6;

type LocationPickerProps = {
  value: LatLng | null;
  onChange: (value: LatLng | null) => void;
  required?: boolean; // form alamat: pin wajib supaya kurir bisa menemukan alamat
  error?: string;
};

// pin lokasi alamat (opsional): dipakai untuk tarif kurir instan GoSend / Grab yang dihitung dari jarak.
// Alternatif tanpa menyeret peta: tombol "Use my current location"
export function LocationPicker({ value, onChange, required = false, error: fieldError }: LocationPickerProps) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string>();

  const pick = (next: LatLng) => {
    setError(undefined);
    onChange({ latitude: round(next.latitude), longitude: round(next.longitude) });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return setError("Your browser can't share its location. Tap the map instead.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        pick({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      },
      () => {
        setLocating(false);
        setError("Couldn't get your location. Allow location access, or tap the map instead.");
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-medium text-ink">
        Pin location
        {required ? <span aria-hidden="true" className="text-danger-text"> *</span> : " (optional)"}
      </legend>
      <p id="pin-hint" className="text-xs text-ink-muted">
        Tap the map or drag the pin to the exact delivery spot. Couriers use it to find the address, and it unlocks same-day couriers like
        GoSend and Grab.
      </p>
      <div className="relative h-56 overflow-hidden rounded-box border border-base-300 sm:h-64">
        <LocationMap value={value} onChange={pick} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={useCurrentLocation} disabled={locating} aria-describedby="pin-hint" className="btn btn-outline btn-sm h-10 gap-1.5 border-base-300 text-ink">
          {locating ? <span aria-hidden="true" className="loading loading-spinner loading-xs" /> : <PiCrosshair aria-hidden="true" size={16} />}
          Use my current location
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="btn btn-ghost btn-sm h-10 gap-1.5 text-ink-muted">
            <PiX aria-hidden="true" size={16} />
            Remove pin
          </button>
        )}
      </div>
      <p aria-live="polite" className="flex items-center gap-1.5 text-xs text-ink-muted tabular-nums">
        {value ? (
          <>
            <PiMapPin aria-hidden="true" size={14} className="text-primary" />
            Pinned at {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
          </>
        ) : (
          required ? "No pin yet." : "No pin yet. Regular couriers are still available without one."
        )}
      </p>
      {(error ?? fieldError) && (
        <p role="alert" className="text-xs text-danger-text">
          {error ?? fieldError}
        </p>
      )}
    </fieldset>
  );
}
