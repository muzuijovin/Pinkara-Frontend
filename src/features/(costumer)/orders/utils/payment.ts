import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiResponse } from "@/types/api-response.type";
import type { OrderDetail, PaymentMethod, VaBank } from "@/types/order.type";

// bank Virtual Account yang didukung (sama dengan VA_BANKS di BE)
export const BANKS: { value: VaBank; label: string }[] = [
  { value: "bca", label: "BCA" },
  { value: "bni", label: "BNI" },
  { value: "bri", label: "BRI" },
  { value: "permata", label: "Permata" },
];

export const bankLabel = (bank: VaBank | null) => BANKS.find((item) => item.value === bank)?.label ?? "Bank";

export function copyText(text: string, label: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} copied`))
    .catch(() => toast.error("Couldn't copy. Please copy it manually."));
}

// langsung buat tagihan setelah pesanan jadi (Place order / Accept & pay) dengan metode & bank yang dipilih saat
// checkout, supaya halaman bayar langsung menampilkan QR / nomor VA. Gagal (mis. gateway gangguan) tidak
// menggagalkan pesanan: dikembalikan order tanpa tagihan -> halaman bayar menampilkan pilihan metode untuk dicoba lagi
export async function createPaymentForNewOrder(order: OrderDetail, method: PaymentMethod, bank: VaBank): Promise<OrderDetail> {
  if (order.payment || (method !== "QRIS" && method !== "VIRTUAL_ACCOUNT")) return order;
  try {
    const res = await axiosInstance.post<ApiResponse<OrderDetail>>(`/orders/${order.code}/payments`, {
      method,
      bank: method === "VIRTUAL_ACCOUNT" ? bank : undefined,
    });
    return res.data.data;
  } catch {
    return order;
  }
}
