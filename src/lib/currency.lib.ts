// uang disimpan sebagai integer rupiah (PRD §14), tampil "Rp150.000"
const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatRupiah = (value: number) => rupiah.format(value).replace(/\s/g, "");

// rentang harga produk bervarian: "Rp150.000 – Rp350.000", atau satu harga kalau sama
export const formatPriceRange = (min: number, max: number) =>
  min === max ? formatRupiah(min) : `${formatRupiah(min)} – ${formatRupiah(max)}`;

// angka ringkas untuk sumbu grafik: 1.250.000 -> "Rp1.3M", 450.000 -> "Rp450K"
export function formatCompactRupiah(value: number) {
  if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `Rp${Math.round(value / 1_000)}K`;
  return `Rp${value}`;
}
