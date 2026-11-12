"use client";

import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { PiPlus, PiTrash } from "react-icons/pi";
import {
  EMPTY_VARIANT,
  MAX_VARIANTS,
  PRODUCT_SIZES,
  type ProductInput,
} from "@/features/validation/productSchema";

type VariantsFieldProps = {
  control: Control<ProductInput>;
  register: UseFormRegister<ProductInput>;
  errors: FieldErrors<ProductInput>;
};

const inputClass = (hasError: boolean) =>
  `input input-sm h-10 w-full text-base sm:text-sm ${hasError ? "input-error" : ""}`;

// varian produk ready stock: label, harga, stok, SKU, ukuran kardus (PRD §12.1b).
// Mode edit: stok varian lama ditampilkan apa adanya, selisihnya dikirim ke BE sebagai stockDelta
// tiap varian = 1 kartu supaya tetap rapi di HP (bukan tabel lebar yang perlu scroll samping)
export function VariantsField({ control, register, errors }: VariantsFieldProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const listError = errors.variants?.root?.message ?? errors.variants?.message;

  const addSizePreset = () => {
    const existing = new Set(fields.map((field) => field.label.toUpperCase()));
    const missing = PRODUCT_SIZES.filter((size) => !existing.has(size));
    append(missing.map((size) => ({ ...EMPTY_VARIANT, label: size, packageSize: size })));
  };

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => {
        const variantErrors = errors.variants?.[index];
        const id = (name: string) => `variants-${index}-${name}`;

        return (
          <fieldset key={field.id} className="rounded-box border border-base-300 p-4">
            {/* legend wajib anak pertama fieldset; judul yang terlihat ada di bawahnya */}
            <legend className="sr-only">Variant {index + 1}</legend>
            <div className="mb-3 flex items-center justify-between">
              <span aria-hidden="true" className="text-sm font-semibold text-ink">
                Variant {index + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove variant ${index + 1}`}
                className="btn btn-ghost btn-sm h-9 gap-1.5 text-danger-text hover:bg-danger-soft"
              >
                <PiTrash aria-hidden="true" size={16} />
                Remove
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="flex flex-col gap-1">
                <label htmlFor={id("label")} className="text-xs font-medium text-ink">
                  Label <span aria-hidden="true" className="text-danger-text">*</span>
                </label>
                <input
                  id={id("label")}
                  placeholder="S, M, Default..."
                  aria-invalid={variantErrors?.label ? true : undefined}
                  className={inputClass(Boolean(variantErrors?.label))}
                  {...register(`variants.${index}.label`)}
                />
                {variantErrors?.label && <p className="text-xs text-danger-text">{variantErrors.label.message}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={id("price")} className="text-xs font-medium text-ink">
                  Price (Rp) <span aria-hidden="true" className="text-danger-text">*</span>
                </label>
                <input
                  id={id("price")}
                  inputMode="numeric"
                  placeholder="150000"
                  aria-invalid={variantErrors?.price ? true : undefined}
                  className={`${inputClass(Boolean(variantErrors?.price))} tabular-nums`}
                  {...register(`variants.${index}.price`)}
                />
                {variantErrors?.price && <p className="text-xs text-danger-text">{variantErrors.price.message}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={id("stock")} className="text-xs font-medium text-ink">
                  Stock <span aria-hidden="true" className="text-danger-text">*</span>
                </label>
                <input
                  id={id("stock")}
                  inputMode="numeric"
                  aria-invalid={variantErrors?.stock ? true : undefined}
                  className={`${inputClass(Boolean(variantErrors?.stock))} tabular-nums`}
                  {...register(`variants.${index}.stock`)}
                />
                {variantErrors?.stock && <p className="text-xs text-danger-text">{variantErrors.stock.message}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={id("sku")} className="text-xs font-medium text-ink">
                  SKU (optional)
                </label>
                <input
                  id={id("sku")}
                  aria-invalid={variantErrors?.sku ? true : undefined}
                  className={inputClass(Boolean(variantErrors?.sku))}
                  {...register(`variants.${index}.sku`)}
                />
                {variantErrors?.sku && <p className="text-xs text-danger-text">{variantErrors.sku.message}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={id("packageSize")} className="text-xs font-medium text-ink">
                  Box size
                </label>
                <select
                  id={id("packageSize")}
                  className="select select-sm h-10 w-full text-base sm:text-sm"
                  {...register(`variants.${index}.packageSize`)}
                >
                  <option value="">No box</option>
                  {PRODUCT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* hanya varian lama (mode edit): sembunyikan tanpa menghapus, mis. ukuran sedang tidak dijual */}
            {field.variantId && (
              <label className="mt-3 flex w-fit cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  {...register(`variants.${index}.isActive`)}
                />
                <span className="text-sm text-ink">Available for sale</span>
              </label>
            )}
          </fieldset>
        );
      })}

      {listError && (
        <p role="alert" className="text-xs text-danger-text">
          {listError}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={fields.length >= MAX_VARIANTS}
          onClick={() => append({ ...EMPTY_VARIANT })}
          className="btn btn-outline btn-primary btn-sm h-10 gap-1.5"
        >
          <PiPlus aria-hidden="true" size={16} />
          Add variant
        </button>
        <button
          type="button"
          disabled={fields.length + PRODUCT_SIZES.length > MAX_VARIANTS}
          onClick={addSizePreset}
          className="btn btn-ghost btn-sm h-10 text-ink"
        >
          Add S / M / L / XL sizes
        </button>
      </div>
    </div>
  );
}
