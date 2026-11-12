import Form from "next/form";
import { PiMagnifyingGlass } from "react-icons/pi";

// submit -> /products?search=... (client-side navigation dari next/form)
export function SearchBar({ className = "" }: { className?: string }) {
  return (
    <Form action="/products" role="search" className={className}>
      <label className="input h-11 w-full border-transparent bg-surface-muted text-ink transition-colors duration-200 focus-within:border-primary focus-within:bg-base-100 focus-within:outline-primary/20">
        <span className="sr-only">Search flowers</span>
        <PiMagnifyingGlass aria-hidden="true" size={18} className="text-ink-muted" />
        <input
          type="search"
          name="search"
          placeholder="Search bouquets, hampers, orchids..."
          autoComplete="off"
          className="grow text-sm placeholder:text-ink-muted"
        />
      </label>
    </Form>
  );
}
