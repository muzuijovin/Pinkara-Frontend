"use client";

import Form from "next/form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useState, type FocusEvent, type KeyboardEvent } from "react";
import { PiArrowRight, PiImageSquare, PiMagnifyingGlass } from "react-icons/pi";
import { useDebounce } from "use-debounce";
import { formatPriceRange, formatRupiah } from "@/lib/currency.lib";
import { SUGGESTION_MIN_CHARS, useSearchSuggestions } from "../hooks/useSearchSuggestions";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// tebalkan bagian nama produk yang cocok dengan kata kunci
function Highlight({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(keyword)})`, "ig"));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={index} className="bg-transparent font-bold text-ink">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

// search bar navbar + dropdown saran (pola combobox WAI-ARIA).
// Ketik >= 2 huruf -> saran produk (debounce 300 ms). ↑/↓ pilih, Enter buka, Esc tutup.
// Enter tanpa memilih saran -> /products?search=… (katalog)
export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const uid = useId();
  const listboxId = `${uid}-suggestions`;
  const optionId = (index: number) => `${uid}-option-${index}`;

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [keyword] = useDebounce(query.trim(), 300);

  const { data: suggestions = [], isFetching, isPending, isError } = useSearchSuggestions(keyword);
  const showPanel = isOpen && keyword.length >= SUGGESTION_MIN_CHARS;
  // opsi terakhir selalu "See all results"
  const optionCount = suggestions.length + 1;
  const searchHref = `/products?search=${encodeURIComponent(keyword)}`;

  const close = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const goTo = (href: string) => {
    close();
    setQuery("");
    router.push(href);
  };

  const selectOption = (index: number) => {
    const product = suggestions[index];
    goTo(product ? `/products/${product.slug}` : searchHref);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showPanel) {
      if (event.key === "ArrowDown" && keyword.length >= SUGGESTION_MIN_CHARS) setIsOpen(true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % optionCount);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? optionCount - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectOption(activeIndex);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  // tutup kalau fokus pindah ke luar komponen ini
  const handleBlur = (event: FocusEvent<HTMLFormElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
  };

  return (
    <Form action="/products" role="search" onBlur={handleBlur} className={`relative ${className}`}>
      <label className="input h-11 w-full border-transparent bg-surface-muted text-ink transition-colors duration-200 focus-within:border-primary focus-within:bg-base-100 focus-within:outline-primary/20">
        <span className="sr-only">Search flowers</span>
        <PiMagnifyingGlass aria-hidden="true" size={18} className="text-ink-muted" />
        <input
          type="search"
          name="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search bouquets, hampers, orchids..."
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={showPanel && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          className="grow text-sm placeholder:text-ink-muted"
        />
        {showPanel && isFetching && (
          <span aria-hidden="true" className="loading loading-spinner loading-xs text-ink-muted" />
        )}
      </label>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 min-w-72 overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-lg">
          {/* status untuk screen reader: jumlah saran setiap kali hasil berubah */}
          <p className="sr-only" aria-live="polite">
            {isPending ? "Searching" : `${suggestions.length} suggestions`}
          </p>

          <ul
            id={listboxId}
            role="listbox"
            aria-label="Search suggestions"
            // mousedown preventDefault: klik saran tidak membuat input blur duluan (panel tidak tertutup sebelum klik)
            onMouseDown={(event) => event.preventDefault()}
            className="max-h-96 overflow-y-auto py-1"
          >
            {isPending ? (
              <li className="flex items-center gap-2 px-4 py-3 text-sm text-ink-muted">
                <span aria-hidden="true" className="loading loading-spinner loading-xs" />
                Searching...
              </li>
            ) : isError ? (
              <li className="px-4 py-3 text-sm text-danger-text">Couldn&apos;t load suggestions.</li>
            ) : suggestions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-ink-muted">
                No products found for &quot;<span className="font-medium text-ink">{keyword}</span>&quot;
              </li>
            ) : (
              suggestions.map((product, index) => (
                <li
                  key={product.id}
                  id={optionId(index)}
                  role="option"
                  aria-selected={activeIndex === index}
                  onClick={() => selectOption(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${activeIndex === index ? "bg-surface-muted" : ""}`}
                >
                  <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                    {product.images[0] ? (
                      <Image src={product.images[0]} alt="" fill sizes="44px" className="object-cover" />
                    ) : (
                      <PiImageSquare aria-hidden="true" size={18} className="text-ink-muted" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm text-ink">
                      <Highlight text={product.name} keyword={keyword} />
                    </span>
                    <span className="line-clamp-1 text-xs text-ink-muted">
                      {product.category.name} ·{" "}
                      {product.type === "CUSTOM"
                        ? `From ${formatRupiah(product.minPrice)}`
                        : formatPriceRange(product.minPrice, product.maxPrice)}
                    </span>
                  </span>
                </li>
              ))
            )}

            <li
              id={optionId(suggestions.length)}
              role="option"
              aria-selected={activeIndex === suggestions.length}
              onClick={() => selectOption(suggestions.length)}
              onMouseEnter={() => setActiveIndex(suggestions.length)}
              className={`mt-1 flex cursor-pointer items-center justify-between gap-2 border-t border-base-300 px-4 py-3 text-sm font-medium text-accent-text ${
                activeIndex === suggestions.length ? "bg-surface-muted" : ""
              }`}
            >
              <span className="line-clamp-1">See all results for &quot;{keyword}&quot;</span>
              <PiArrowRight aria-hidden="true" size={16} className="shrink-0" />
            </li>
          </ul>
        </div>
      )}
    </Form>
  );
}
