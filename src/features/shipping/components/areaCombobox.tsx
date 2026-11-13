"use client";

import { useId, useState } from "react";
import { PiCheckCircle, PiMagnifyingGlass, PiMapPinArea, PiProhibit } from "react-icons/pi";
import { useDebounce } from "use-debounce";
import { getErrorMessage } from "@/lib/error.lib";
import type { Area } from "@/types/shipping.type";
import { AREA_MIN_CHARS, useAreaSearch } from "../hooks/useAreaSearch";

export type SelectedArea = { id: string; name: string };

type AreaComboboxProps = {
  value: SelectedArea | null;
  onChange: (area: Area | null) => void;
  error?: string;
};

// pilih kecamatan dari daftar resmi (kota & kode pos ikut dari sini, tidak bisa diketik bebas).
// Combobox: ketik -> panah atas/bawah -> Enter memilih, Esc menutup. Wilayah di luar Malang Raya tidak bisa dipilih
export function AreaCombobox({ value, onChange, error }: AreaComboboxProps) {
  const inputId = useId();
  const listId = useId();
  const hintId = useId();
  const errorId = useId();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [query] = useDebounce(text, 300);
  const { data: areas = [], isFetching, error: searchError } = useAreaSearch(query);

  const tooShort = text.trim().length < AREA_MIN_CHARS;
  const showList = open && !tooShort;
  const optionId = (index: number) => `${listId}-${index}`;

  const choose = (area: Area) => {
    if (!area.deliverable) return;
    onChange(area);
    setText("");
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, areas.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && showList && areas[active]) {
      event.preventDefault();
      choose(areas[active]);
    } else if (event.key === "Escape" && open) {
      event.stopPropagation();
      setOpen(false);
    }
  };

  // sudah memilih wilayah -> tampilkan hasilnya + tombol ganti
  if (value) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">
          District, city &amp; postal code<span aria-hidden="true" className="text-danger-text"> *</span>
        </span>
        <div className="flex items-center gap-3 rounded-box border border-primary bg-accent-soft/30 px-3 py-2.5">
          <PiCheckCircle aria-hidden="true" size={20} className="shrink-0 text-primary" />
          <span className="min-w-0 flex-1 text-sm text-ink wrap-anywhere">{value.name}</span>
          <button type="button" onClick={() => onChange(null)} className="btn btn-ghost btn-sm h-9 text-accent-text">
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        District, city &amp; postal code<span aria-hidden="true" className="text-danger-text"> *</span>
      </label>
      <span className={`input flex w-full items-center gap-2 ${error ? "input-error" : ""}`}>
        <PiMagnifyingGlass aria-hidden="true" size={18} className="shrink-0 text-ink-muted" />
        <input
          id={inputId}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && areas[active] ? optionId(active) : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${hintId}${error ? ` ${errorId}` : ""}`}
          aria-required
          autoComplete="off"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          placeholder="Type your district, e.g. Klojen or Lowokwaru"
          className="min-w-0 flex-1 text-base sm:text-sm"
        />
        {isFetching && <span aria-hidden="true" className="loading loading-spinner loading-xs text-ink-muted" />}
      </span>
      <span id={hintId} className="text-xs text-ink-muted">
        We deliver within Malang, Batu and Malang Regency. Choose your district from the list.
      </span>
      {error && (
        <span id={errorId} role="alert" className="text-xs text-danger-text">
          {error}
        </span>
      )}

      {showList && (
        <ul id={listId} role="listbox" aria-label="Districts" className="absolute top-[4.6rem] z-30 max-h-64 w-full overflow-y-auto rounded-box border border-base-300 bg-base-100 p-1 shadow-lg">
          {Boolean(searchError) && <li className="px-3 py-2.5 text-sm text-danger-text">{getErrorMessage(searchError, "Couldn't search areas.")}</li>}
          {!searchError && !isFetching && query.trim().length >= AREA_MIN_CHARS && areas.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-ink-muted">No districts found. Try another spelling or a postal code.</li>
          )}
          {areas.map((area, index) => (
            <li
              key={area.id}
              id={optionId(index)}
              role="option"
              aria-selected={index === active}
              aria-disabled={!area.deliverable || undefined}
              // mousedown (bukan click) supaya terpilih sebelum input kehilangan fokus
              onMouseDown={(event) => {
                event.preventDefault();
                choose(area);
              }}
              onMouseEnter={() => setActive(index)}
              className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm ${index === active ? "bg-surface-muted" : ""} ${
                area.deliverable ? "cursor-pointer text-ink" : "cursor-not-allowed text-ink-muted"
              }`}
            >
              {area.deliverable ? (
                <PiMapPinArea aria-hidden="true" size={18} className="mt-px shrink-0 text-ink-muted" />
              ) : (
                <PiProhibit aria-hidden="true" size={18} className="mt-px shrink-0" />
              )}
              <span className="flex flex-col">
                <span>{area.name}</span>
                {!area.deliverable && <span className="text-xs">Outside our delivery area</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
