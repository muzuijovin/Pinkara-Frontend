import { toast } from "react-toastify";
import type { VaBank } from "@/types/order.type";

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
