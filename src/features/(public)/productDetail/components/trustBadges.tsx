import { PiCreditCard, PiSealCheck, PiTruck } from "react-icons/pi";

const BADGES = [
  { icon: PiSealCheck, title: "Fresh guarantee", text: "Picked daily" },
  { icon: PiTruck, title: "Same-day delivery", text: "Greater Malang" },
  { icon: PiCreditCard, title: "Easy payment", text: "QRIS & bank transfer" },
];

// badge jaminan di bawah galeri (Figma 1:51)
export function TrustBadges() {
  return (
    <ul className="grid grid-cols-3 gap-2">
      {BADGES.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex flex-col items-center gap-1 rounded-box border border-base-300 bg-base-100 p-3 text-center">
          <Icon aria-hidden="true" size={22} className="text-primary" />
          <span className="text-xs font-semibold text-ink">{title}</span>
          <span className="text-[11px] text-ink-muted">{text}</span>
        </li>
      ))}
    </ul>
  );
}
