import { usePathname, useRouter, useSearchParams } from "next/navigation";

// semua filter katalog disimpan di URL (PRD §6.2) supaya bisa dibagikan & tombol back berfungsi:
//   /products?kategori=bloom-box,round-bouquet&tipe=ready&min=100000&max=500000&tersedia=1&urut=termurah&page=2&search=rose
// nama param mengikuti contoh PRD (?kategori=…&tipe=…) dan link kategori di navbar

export const SORT_OPTIONS = [
  { value: "terbaru", label: "Newest", sortBy: "createdAt", order: "desc" },
  { value: "termurah", label: "Price: low to high", sortBy: "price", order: "asc" },
  { value: "termahal", label: "Price: high to low", sortBy: "price", order: "desc" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
export type TypeValue = "ready" | "custom";

export type CatalogFilters = {
  categories: string[]; // slug
  type?: TypeValue;
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  sort: SortValue;
  search: string;
  page: number;
};

const toNumber = (value: string | null) => {
  if (!value || !/^\d+$/.test(value)) return undefined;
  return Number(value);
};

export function parseCatalogFilters(params: URLSearchParams): CatalogFilters {
  const type = params.get("tipe");
  const sort = params.get("urut");
  return {
    categories: (params.get("kategori") ?? "").split(",").map((slug) => slug.trim()).filter(Boolean),
    type: type === "ready" || type === "custom" ? type : undefined,
    minPrice: toNumber(params.get("min")),
    maxPrice: toNumber(params.get("max")),
    inStock: params.get("tersedia") === "1",
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? (sort as SortValue) : "terbaru",
    search: params.get("search")?.trim() ?? "",
    page: Math.max(1, toNumber(params.get("page")) ?? 1),
  };
}

// jumlah filter yang aktif (untuk badge tombol Filter di HP); urutan & pencarian tidak dihitung
export const countActiveFilters = (filters: CatalogFilters) =>
  filters.categories.length +
  (filters.type ? 1 : 0) +
  (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
  (filters.inStock ? 1 : 0);

type FilterChanges = Partial<Record<"kategori" | "tipe" | "min" | "max" | "tersedia" | "urut" | "search" | "page", string | undefined>>;

export function useCatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = parseCatalogFilters(new URLSearchParams(searchParams.toString()));

  // ubah param URL; filter apa pun yang berubah membuat halaman kembali ke 1
  const setParams = (changes: FilterChanges) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in changes)) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const toggleCategory = (slug: string) => {
    const set = new Set(filters.categories);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    setParams({ kategori: [...set].join(",") || undefined });
  };

  // hapus semua filter, tapi kata kunci pencarian & urutan tetap
  const clearFilters = () =>
    setParams({ kategori: undefined, tipe: undefined, min: undefined, max: undefined, tersedia: undefined });

  const goToPage = (page: number) => {
    setParams({ page: page > 1 ? String(page) : undefined });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { filters, setParams, toggleCategory, clearFilters, goToPage };
}
