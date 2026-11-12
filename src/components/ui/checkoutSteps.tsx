const STEPS = ["Cart", "Shipping", "Payment"] as const;

// langkah belanja (Figma: Keranjang -> Alamat & Jadwal -> Pembayaran). current = index langkah aktif
export function CheckoutSteps({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol aria-label="Checkout steps" className="flex items-center gap-2 text-sm">
      {STEPS.map((step, index) => {
        const isCurrent = index === current;
        const isDone = index < current;
        return (
          <li key={step} aria-current={isCurrent ? "step" : undefined} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden="true" className={`h-px w-6 sm:w-10 ${isDone || isCurrent ? "bg-primary" : "bg-base-300"}`} />
            )}
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                isCurrent
                  ? "bg-primary text-primary-content"
                  : isDone
                    ? "bg-accent-soft text-accent-text"
                    : "bg-surface-sunken text-ink-muted"
              }`}
            >
              {isDone ? "✓" : index + 1}
            </span>
            <span className={isCurrent ? "font-semibold text-ink" : "text-ink-muted"}>
              {step}
              {isDone && <span className="sr-only"> (completed)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
