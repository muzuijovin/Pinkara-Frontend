import type { ComponentProps } from "react";

type TextFieldProps = ComponentProps<"input"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

// input + label + pesan error di bawah field (dipakai dengan register() react-hook-form)
export function TextField({ id, label, error, hint, required, className = "", ...props }: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

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
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy}
        className={`input h-11 w-full text-base sm:text-sm ${error ? "input-error" : ""} ${className}`}
        {...props}
      />
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
