import type { ComponentProps } from "react";

type TextareaFieldProps = ComponentProps<"textarea"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  // tampilkan penghitung "120 / 5000" kalau diisi
  count?: { value: number; max: number };
};

// textarea + label + pesan error (dipakai dengan register() react-hook-form)
export function TextareaField({ id, label, error, hint, count, required, className = "", ...props }: TextareaFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const overLimit = count ? count.value > count.max : false;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="text-danger-text">
            {" "}
            *
          </span>
        )}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy}
        className={`textarea w-full text-base leading-relaxed sm:text-sm ${error ? "textarea-error" : ""} ${className}`}
        {...props}
      />
      <div className="flex items-start justify-between gap-3 text-xs">
        {error ? (
          <p id={`${id}-error`} className="text-danger-text">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-ink-muted">
            {hint}
          </p>
        ) : (
          <span />
        )}
        {count && (
          <span className={`shrink-0 tabular-nums ${overLimit ? "text-danger-text" : "text-ink-muted"}`}>
            {count.value.toLocaleString("en-US")} / {count.max.toLocaleString("en-US")}
          </span>
        )}
      </div>
    </div>
  );
}
