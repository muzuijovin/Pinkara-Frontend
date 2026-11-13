"use client";

import dynamic from "next/dynamic";
import { useId, useState } from "react";
import { PiCrosshair, PiMagnifyingGlass, PiMapPin, PiMapPinLine, PiX } from "react-icons/pi";
import { usePlaceSearch, type Place } from "../hooks/usePlaceSearch";
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
  const searchId = useId();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string>();
  // cari tempat: teks yang diketik vs query yang benar-benar dicari (hanya saat Search / Enter)
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const { data: places, isFetching: searching, error: searchError } = usePlaceSearch(query);
  const [showResults, setShowResults] = useState(false);

  const pick = (next: LatLng) => {
    setError(undefined);
    onChange({ latitude: round(next.latitude), longitude: round(next.longitude) });
  };

  const runSearch = () => {
    const text = searchText.trim();
    if (text.length < 3) return setError("Type at least 3 characters to search the map.");
    setError(undefined);
    setQuery(text);
    setShowResults(true);
  };

  // pilih hasil -> pin pindah ke sana (peta ikut bergeser), pembeli tinggal geser sedikit kalau perlu
  const choosePlace = (place: Place) => {
    pick(place);
    setShowResults(false);
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
        Search for a street or place, then tap the map or drag the pin to the exact delivery spot. Couriers use it to find the address, and it
        unlocks same-day couriers like GoSend and Grab.
      </p>

      {/* bukan <form>: komponen ini ada di dalam form alamat -> Enter ditangani manual supaya tidak menyimpan alamat */}
      <div role="search" className="flex flex-col gap-1.5">
        <label htmlFor={searchId} className="sr-only">
          Search the map
        </label>
        <div className="flex gap-2">
          <span className="input flex min-w-0 flex-1 items-center gap-2">
            <PiMagnifyingGlass aria-hidden="true" size={18} className="shrink-0 text-ink-muted" />
            <input
              id={searchId}
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  runSearch();
                }
              }}
              placeholder="Search street, building or area"
              autoComplete="off"
              className="min-w-0 flex-1 text-base sm:text-sm"
            />
          </span>
          <button type="button" onClick={runSearch} disabled={searching} className="btn btn-outline h-10 min-h-10 border-base-300 text-ink">
            {searching ? <span aria-hidden="true" className="loading loading-spinner loading-xs" /> : null}
            Search
          </button>
        </div>
        {showResults && query && !searching && (
          <div aria-live="polite">
            {searchError ? (
              <p className="text-xs text-danger-text">{searchError.message}</p>
            ) : places?.length ? (
              <ul aria-label="Map search results" className="flex flex-col rounded-box border border-base-300 bg-base-100 p-1">
                {places.map((place) => (
                  <li key={place.id}>
                    <button
                      type="button"
                      onClick={() => choosePlace(place)}
                      className="flex min-h-11 w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-surface-muted focus-visible:bg-surface-muted"
                    >
                      <PiMapPinLine aria-hidden="true" size={18} className="mt-px shrink-0 text-ink-muted" />
                      <span className="line-clamp-2">{place.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-ink-muted">No places found. Try a nearby street or landmark, or tap the map.</p>
            )}
          </div>
        )}
      </div>

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
