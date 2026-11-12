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
