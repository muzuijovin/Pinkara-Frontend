"use client";

import { useState, type ComponentProps } from "react";
import { PiEye, PiEyeSlash } from "react-icons/pi";

type PasswordFieldProps = Omit<ComponentProps<"input">, "type"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

// input password dengan tombol tampilkan / sembunyikan
export function PasswordField({
  id,
  label,
  error,
  hint,
  required,
  "aria-describedby": extraDescribedBy,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  // gabung id pesan error/hint dengan deskripsi tambahan (mis. checklist syarat password)
  const describedBy =
    [error ? `${id}-error` : hint ? `${id}-hint` : undefined, extraDescribedBy]
      .filter(Boolean)
      .join(" ") || undefined;

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
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          className={`input h-11 w-full pr-12 text-base sm:text-sm ${error ? "input-error" : ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={id}
          className="btn btn-ghost btn-square absolute right-0 top-0 z-10 size-11 text-ink-muted hover:bg-transparent hover:text-ink"
        >
          {visible ? <PiEyeSlash aria-hidden="true" size={20} /> : <PiEye aria-hidden="true" size={20} />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger-text">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-ink-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
