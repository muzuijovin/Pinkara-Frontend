import type { ReactNode } from "react";

type OptionCardProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode; // mis. harga ongkir di kanan
  icon?: ReactNode;
  disabled?: boolean;
};

// pilihan berbentuk kartu (radio asli di dalamnya -> bisa dipakai keyboard & screen reader)
export function OptionCard({ name, value, checked, onChange, title, description, aside, icon, disabled }: OptionCardProps) {
  return (
    <label
      className={`flex items-start gap-3 rounded-box border p-4 transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${
        checked ? "border-primary bg-accent-soft/30" : "border-base-300"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary/50"}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="radio radio-primary radio-sm mt-0.5"
      />
      {icon && (
        <span aria-hidden="true" className="mt-0.5 shrink-0 text-ink-muted">
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold text-ink">{title}</span>
        {description && <span className="text-xs leading-relaxed text-ink-muted">{description}</span>}
      </span>
      {aside && <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">{aside}</span>}
    </label>
  );
}
