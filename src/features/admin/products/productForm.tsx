"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PiCaretRight, PiFlowerTulip, PiPaintBrush } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { TextareaField } from "@/components/form/textareaField";
import { TextField } from "@/components/form/textField";
import { useCategories } from "@/features/categories/hooks/useCategories";
import {
  ADDON_TYPES,
  DESCRIPTION_MAX,
  EMPTY_VARIANT,
  productSchema,
  type ProductInput,
} from "@/features/validation/productSchema";
import { getErrorMessage } from "@/lib/error.lib";
import type { AddonType, ProductStatus } from "@/types/product.type";
import { ProductImagesInput, type ProductImage } from "./components/productImagesInput";
import { VariantsField } from "./components/variantsField";
import { useCreateProduct } from "./hooks/useCreateProduct";
import { useUnsavedChangesWarning } from "./hooks/useUnsavedChangesWarning";

const DEFAULT_VALUES: ProductInput = {
  name: "",
  categoryId: "",
  type: "READY",
  description: "",
  variants: [{ ...EMPTY_VARIANT, label: "Default" }],
  basePrice: "",
  productionDays: "",
  dimensions: "",
  materials: "",
  isFeatured: false,
  useCategoryAddons: true,
  allowedAddonTypes: [],
};

const ADDON_LABELS: Record<AddonType, { label: string; hint: string }> = {
  PACKAGING: { label: "Packaging box", hint: "S / M / L / XL, matched to the variant size" },
  PAPER_BAG: { label: "Paper bag", hint: "Buyer chooses the quantity" },
  GIFT_CARD: { label: "Gift card", hint: "Printed message, up to 200 characters" },
};

const TYPE_OPTIONS = [
  {
    value: "READY",
    label: "Ready stock",
    description: "Fixed price & stock per variant. Buyers add it to their cart.",
    icon: PiFlowerTulip,
  },
  {
    value: "CUSTOM",
    label: "Custom / pre-order",
    description: "\"Starting from\" price. Buyers send a brief and you send a quote.",
    icon: PiPaintBrush,
  },
] as const;

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="card border border-base-300 bg-base-100">
      <div className="card-body gap-5 p-6">
        <header>
          <h2 id={id} className="text-lg font-semibold text-ink">
            {title}
          </h2>
          {description && <p className="text-sm text-ink-muted">{description}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

// form upload produk baru (PRD §12.1b). Edit produk nanti memakai form yang sama
export function ProductForm() {
  const router = useRouter();
  const { mutate, isPending, isSuccess, error, variables } = useCreateProduct();
  const { data: categories = [], isPending: isLoadingCategories } = useCategories();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [imagesError, setImagesError] = useState<string>();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<ProductInput>({ resolver: zodResolver(productSchema), defaultValues: DEFAULT_VALUES });

  const type = useWatch({ control, name: "type" });
  const description = useWatch({ control, name: "description" });
  const useCategoryAddons = useWatch({ control, name: "useCategoryAddons" });

  // peringatan saat menutup tab kalau ada isian yang belum disimpan
  useUnsavedChangesWarning((isDirty || images.length > 0) && !isSuccess);

  const handleImagesChange = (next: ProductImage[]) => {
    setImages(next);
    if (next.length) setImagesError(undefined);
  };

  const submitWith = (status: Extract<ProductStatus, "DRAFT" | "ACTIVE">) =>
    handleSubmit(
      (values) => {
        if (!images.length) {
          setImagesError("Add at least 1 photo");
          return;
        }
        mutate(
          { values, images: images.map((image) => image.file), status },
          {
            onSuccess: (product) => {
              toast.success(
                status === "ACTIVE" ? `"${product.name}" is now live.` : `"${product.name}" was saved as a draft.`,
              );
              router.push("/admin/products");
            },
            onError: (err) => toast.error(getErrorMessage(err, "Couldn't save the product. Please try again.")),
          },
        );
      },
      // foto dicek juga saat field lain error, supaya semua kesalahan terlihat sekaligus
      () => {
        if (!images.length) setImagesError("Add at least 1 photo");
      },
    );

  const pendingStatus = isPending ? variables?.status : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-sm text-ink-muted">
        <Link href="/admin/products" className="rounded hover:text-ink hover:underline">
          Products
        </Link>
        <PiCaretRight aria-hidden="true" size={12} />
        <span aria-current="page" className="text-ink">
          Add product
        </span>
      </nav>
      <h1 className="text-2xl font-bold text-ink md:text-3xl">Add product</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Save as a draft to finish later, or publish to show it in the catalog right away.
      </p>

      <form
        noValidate
        onSubmit={submitWith("ACTIVE")}
        className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_320px]"
      >
        <div className="flex min-w-0 flex-col gap-6">
          {error && <FormAlert message={getErrorMessage(error, "Couldn't save the product. Please try again.")} />}

          <Section id="basic-info" title="Basic info">
            <TextField
              id="name"
              label="Product name"
              placeholder="e.g. Blossom Whisper Rose & Peony"
              required
              error={errors.name?.message}
              {...register("name")}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="categoryId" className="text-sm font-medium text-ink">
                Category <span aria-hidden="true" className="text-danger-text">*</span>
              </label>
              <select
                id="categoryId"
                disabled={isLoadingCategories}
                aria-invalid={errors.categoryId ? true : undefined}
                aria-describedby={errors.categoryId ? "categoryId-error" : undefined}
                className={`select h-11 w-full text-base sm:text-sm ${errors.categoryId ? "select-error" : ""}`}
                {...register("categoryId")}
              >
                <option value="">{isLoadingCategories ? "Loading categories..." : "Choose a category"}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p id="categoryId-error" className="text-xs text-danger-text">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-sm font-medium text-ink">
                Product type <span aria-hidden="true" className="text-danger-text">*</span>
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {TYPE_OPTIONS.map(({ value, label, description: optionDescription, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer gap-3 rounded-box border p-4 transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${
                      type === value ? "border-primary bg-accent-soft/30" : "border-base-300 hover:border-primary/50"
                    }`}
                  >
                    <input type="radio" value={value} className="radio radio-primary radio-sm mt-0.5" {...register("type")} />
                    <span className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                        <Icon aria-hidden="true" size={16} />
                        {label}
                      </span>
                      <span className="text-xs text-ink-muted">{optionDescription}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <TextareaField
              id="description"
              label="Description"
              rows={6}
              placeholder="Tell buyers about the flowers, colors, and occasions this product suits."
              required
              count={{ value: description.length, max: DESCRIPTION_MAX }}
              error={errors.description?.message}
              {...register("description")}
            />
          </Section>

          <Section id="photos" title="Photos" description="1–8 photos. The first photo is the cover shown in the catalog.">
            <ProductImagesInput images={images} onChange={handleImagesChange} error={imagesError} />
          </Section>

          {type === "READY" ? (
            <Section
              id="pricing"
              title="Variants, price & stock"
              description="Each variant has its own price and stock, e.g. sizes S, M, L, XL for Round Bouquet."
            >
              <VariantsField control={control} register={register} errors={errors} />
            </Section>
          ) : (
            <Section
              id="pricing"
              title="Pricing"
              description="Custom products don't use stock. The final price is agreed in the quote."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  id="basePrice"
                  label="Starting price (Rp)"
                  inputMode="numeric"
                  placeholder="250000"
                  required
                  hint='Shown as "Starting from Rp…"'
                  error={errors.basePrice?.message}
                  {...register("basePrice")}
                />
                <TextField
                  id="productionDays"
                  label="Production time in days (optional)"
                  inputMode="numeric"
                  placeholder="3"
                  error={errors.productionDays?.message}
                  {...register("productionDays")}
                />
              </div>
            </Section>
          )}

          <Section id="details" title="Details" description="Optional, but helps buyers decide.">
            <TextField
              id="dimensions"
              label="Dimensions (optional)"
              placeholder="e.g. 30 x 20 x 15 cm"
              error={errors.dimensions?.message}
              {...register("dimensions")}
            />
            <TextareaField
              id="materials"
              label="Materials / contents (optional)"
              rows={3}
              placeholder="e.g. 12 red roses, 3 white peonies, eucalyptus, Korean wrapping paper"
              error={errors.materials?.message}
              {...register("materials")}
            />
          </Section>
        </div>

        {/* kolom kanan: publish + add-on (sticky di desktop) */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <section aria-labelledby="publish-title" className="card border border-base-300 bg-base-100">
            <div className="card-body gap-4 p-6">
              <h2 id="publish-title" className="text-lg font-semibold text-ink">
                Publish
              </h2>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="toggle toggle-primary toggle-sm mt-0.5" {...register("isFeatured")} />
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-ink">Featured product</span>
                  <span className="text-xs text-ink-muted">Shown in &quot;Featured&quot; on the home page.</span>
                </span>
              </label>
              <div className="flex flex-col gap-2 border-t border-base-300 pt-4">
                <button type="submit" disabled={isPending || isSuccess} className="btn btn-primary h-11 w-full text-[15px]">
                  {pendingStatus === "ACTIVE" && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
                  {pendingStatus === "ACTIVE" ? "Publishing..." : "Publish"}
                </button>
                <button
                  type="button"
                  disabled={isPending || isSuccess}
                  onClick={submitWith("DRAFT")}
                  className="btn btn-outline h-11 w-full border-base-300 text-[15px] text-ink"
                >
                  {pendingStatus === "DRAFT" && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
                  {pendingStatus === "DRAFT" ? "Saving..." : "Save as draft"}
                </button>
                <p className="text-xs text-ink-muted">Drafts are hidden from buyers until you publish them.</p>
              </div>
            </div>
          </section>

          <section aria-labelledby="addons-title" className="card border border-base-300 bg-base-100">
            <div className="card-body gap-4 p-6">
              <div>
                <h2 id="addons-title" className="text-lg font-semibold text-ink">
                  Add-ons
                </h2>
                <p className="text-sm text-ink-muted">Extras buyers can attach to this product.</p>
              </div>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm mt-0.5"
                  {...register("useCategoryAddons")}
                />
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-ink">Use category defaults</span>
                  <span className="text-xs text-ink-muted">Turn off to choose add-ons manually.</span>
                </span>
              </label>

              {!useCategoryAddons && (
                <fieldset className="flex flex-col gap-3 border-t border-base-300 pt-4">
                  <legend className="sr-only">Allowed add-ons</legend>
                  {ADDON_TYPES.map((addon) => (
                    <label key={addon} className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        value={addon}
                        className="checkbox checkbox-primary checkbox-sm mt-0.5"
                        {...register("allowedAddonTypes")}
                      />
                      <span className="flex flex-col">
                        <span className="text-sm font-medium text-ink">{ADDON_LABELS[addon].label}</span>
                        <span className="text-xs text-ink-muted">{ADDON_LABELS[addon].hint}</span>
                      </span>
                    </label>
                  ))}
                  <p className="text-xs text-ink-muted">Leave all unchecked for no add-ons (e.g. Keychain).</p>
                </fieldset>
              )}
            </div>
          </section>
        </aside>
      </form>
    </div>
  );
}
