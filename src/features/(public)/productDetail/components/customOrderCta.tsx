import Link from "next/link";
import { PiChatsCircle } from "react-icons/pi";

const STEPS = ["Send your brief", "Chat with our florist", "Get a quote", "Pay & we craft it", "Delivered to you"];

// produk CUSTOM: tombol "Order custom" -> form brief (PRD §6.3 & §8). Halaman brief wajib login
export function CustomOrderCta({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col gap-4">
      <ol className="grid gap-2 sm:grid-cols-5">
        {STEPS.map((step, index) => (
          <li key={step} className="flex items-center gap-2 text-xs text-ink-muted sm:flex-col sm:text-center">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent-text">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <Link
        href={`/custom-requests/new?product=${encodeURIComponent(slug)}`}
        className="btn btn-primary h-12 gap-2 text-[15px]"
      >
        <PiChatsCircle aria-hidden="true" size={20} />
        Order custom
      </Link>
      <p className="text-xs text-ink-muted">You&apos;ll need to log in to send a brief. No payment until you accept the quote.</p>
    </div>
  );
}
