"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PiArrowClockwise, PiCaretRight, PiFlowerTulip, PiPaintBrush, PiTrash } from "react-icons/pi";
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
import type { AddonType, AdminProductDetail, ProductStatus } from "@/types/product.type";
import { DeleteProductDialog } from "./components/deleteProductDialog";
import { ProductImagesInput, type ProductImage } from "./components/productImagesInput";
import { VariantsField } from "./components/variantsField";
import { useCreateProduct } from "./hooks/useCreateProduct";
import { useUnsavedChangesWarning } from "./hooks/useUnsavedChangesWarning";
import { useUpdateProduct } from "./hooks/useUpdateProduct";

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
  announce: false,
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

// status produk saat edit (PRD §12.1c)
const STATUS_OPTIONS: { value: ProductStatus; label: string; hint: string }[] = [
  { value: "ACTIVE", label: "Active", hint: "Shown in the catalog" },
  { value: "DRAFT", label: "Draft", hint: "Hidden, still being prepared" },
  { value: "INACTIVE", label: "Inactive", hint: "Hidden, e.g. out of season" },
];

// BE menyimpan deskripsi lewat sanitize-html, yang mengubah "&" jadi "&amp;" dst.
// Dikembalikan ke teks biasa supaya tidak tampil "&amp;" di textarea / ter-encode dobel saat disimpan ulang
function decodeEntities(text: string) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

// data produk dari BE -> nilai awal form edit (angka jadi string, null jadi "")
function toFormValues(product: AdminProductDetail): ProductInput {
  return {
    name: product.name,
    categoryId: product.categoryId,
    type: product.type,
    description: decodeEntities(product.description),
    variants: product.variants.map((variant) => ({
      variantId: variant.id,
      label: variant.label,
      price: String(variant.price),
      stock: String(variant.stock),
      sku: variant.sku ?? "",
      packageSize: variant.packageSize ?? "",
      isActive: variant.isActive,
    })),
    basePrice: product.basePrice ? String(product.basePrice) : "",
    productionDays: product.productionDays ? String(product.productionDays) : "",
    dimensions: product.dimensions ?? "",
    materials: product.materials ?? "",
    isFeatured: product.isFeatured,
    announce: false,
    // saat edit, add-on yang tersimpan selalu dipilih manual (tidak ada lagi "ikut kategori")
    useCategoryAddons: false,
    allowedAddonTypes: product.allowedAddonTypes,
  };
}

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

type ProductFormProps = {
  // terisi = mode edit (PRD §12.1c), kosong = tambah produk baru (PRD §12.1b)
  product?: AdminProductDetail;
  // ambil ulang data terbaru (dipakai saat bentrok dengan perubahan admin lain)
  onReload?: () => void;
};

// form tambah & edit produk
export function ProductForm({ product, onReload }: ProductFormProps) {
  const isEdit = Boolean(product);
  const router = useRouter();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: categories = [], isPending: isLoadingCategories } = useCategories();

  const initialImages: ProductImage[] = product?.images.map((url) => ({ id: url, url })) ?? [];
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [imagesChanged, setImagesChanged] = useState(false);
  const [imagesError, setImagesError] = useState<string>();
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "ACTIVE");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // stok varian lama saat form dibuka -> dasar hitung stockDelta
  const [originalStock] = useState<Record<string, number>>(() =>
    Object.fromEntries(product?.variants.map((variant) => [variant.id, variant.stock]) ?? []),
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? toFormValues(product) : DEFAULT_VALUES,
  });

  const type = useWatch({ control, name: "type" });
  const description = useWatch({ control, name: "description" });
  const useCategoryAddons = useWatch({ control, name: "useCategoryAddons" });

  const mutation = isEdit ? updateProduct : createProduct;
  const { isPending, isSuccess, error } = mutation;
  // 409 = produk sudah diubah admin lain sejak form dibuka (optimistic locking)
  const isConflict = isEdit && isAxiosError(error) && error.response?.status === 409;

  // peringatan saat menutup tab kalau ada isian yang belum disimpan
  useUnsavedChangesWarning((isDirty || imagesChanged || status !== (product?.status ?? "ACTIVE")) && !isSuccess);

  const handleImagesChange = (next: ProductImage[]) => {
    setImages(next);
    setImagesChanged(true);
    if (next.length) setImagesError(undefined);
  };

  const onError = (err: unknown) => toast.error(getErrorMessage(err, "Couldn't save the product. Please try again."));

  const submitWith = (submitStatus: ProductStatus) =>
    handleSubmit(
      (values) => {
        if (!images.length) {
          setImagesError("Add at least 1 photo");
          return;
        }

        if (product) {
          updateProduct.mutate(
            { id: product.id, version: product.version, values, images, status: submitStatus, originalStock },
            {
              onSuccess: (updated) => {
                toast.success(`"${updated.name}" was updated.`);
                router.push("/admin/products");
              },
              onError,
            },
          );
          return;
        }

        createProduct.mutate(
          {
            values,
            images: images.flatMap((image) => (image.file ? [image.file] : [])),
            status: submitStatus === "DRAFT" ? "DRAFT" : "ACTIVE",
          },
          {
            onSuccess: (created) => {
              toast.success(
                submitStatus === "ACTIVE" ? `"${created.name}" is now live.` : `"${created.name}" was saved as a draft.`,
              );
              router.push("/admin/products");
            },
            onError,
          },
        );
      },
      // foto dicek juga saat field lain error, supaya semua kesalahan terlihat sekaligus
      () => {
        if (!images.length) setImagesError("Add at least 1 photo");
      },
    );

  const pendingStatus = isPending && !isEdit ? createProduct.variables?.status : undefined;
  const title = isEdit ? "Edit product" : "Add product";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-sm text-ink-muted">
        <Link href="/admin/products" className="rounded hover:text-ink hover:underline">
          Products
        </Link>
        <PiCaretRight aria-hidden="true" size={12} />
        <span aria-current="page" className="line-clamp-1 text-ink">
          {product ? product.name : title}
        </span>
      </nav>
      <h1 className="text-2xl font-bold text-ink md:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {isEdit
          ? "Changes are visible to buyers as soon as you save."
          : "Save as a draft to finish later, or publish to show it in the catalog right away."}
      </p>

      <form
        noValidate
        onSubmit={submitWith(isEdit ? status : "ACTIVE")}
        className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_320px]"
      >
        <div className="flex min-w-0 flex-col gap-6">
          {isConflict ? (
            <div role="alert" className="alert flex-col items-start gap-3 border-warning/40 bg-warning/15 sm:flex-row sm:items-center">
              <p className="flex-1 text-sm text-ink">
                Someone else changed this product (or new orders changed its stock) while you were editing. Reload to
                get the latest version. Your unsaved changes will be lost.
              </p>
              <button type="button" onClick={onReload} className="btn btn-sm h-10 gap-1.5">
                <PiArrowClockwise aria-hidden="true" size={16} />
                Reload latest
              </button>
            </div>
          ) : (
            error && <FormAlert message={getErrorMessage(error, "Couldn't save the product. Please try again.")} />
          )}

          <Section id="basic-info" title="Basic info">
            <TextField
              id="name"
              label="Product name"
              placeholder="e.g. Blossom Whisper Rose & Peony"
              required
              hint={isEdit ? "Changing the name also changes the product link. Old links still redirect." : undefined}
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
                {/* kategori produk sudah nonaktif -> tetap tampil supaya pilihan tidak hilang */}
                {product && !isLoadingCategories && !categories.some((category) => category.id === product.categoryId) && (
                  <option value={product.categoryId}>{product.category.name} (inactive)</option>
                )}
              </select>
              {errors.categoryId && (
                <p id="categoryId-error" className="text-xs text-danger-text">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <fieldset className="flex flex-col gap-1.5" disabled={isEdit}>
              <legend className="mb-1.5 text-sm font-medium text-ink">
                Product type <span aria-hidden="true" className="text-danger-text">*</span>
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {TYPE_OPTIONS.map(({ value, label, description: optionDescription, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex gap-3 rounded-box border p-4 transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${
                      type === value ? "border-primary bg-accent-soft/30" : "border-base-300"
                    } ${isEdit ? (type === value ? "" : "opacity-50") : "cursor-pointer hover:border-primary/50"}`}
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
              {isEdit && <p className="text-xs text-ink-muted">The product type can&apos;t be changed after it&apos;s created.</p>}
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

          <Section
            id="photos"
            title="Photos"
            description={
              isEdit
                ? "1–8 photos. The first photo is the cover. New photos are added after the current ones."
                : "1–8 photos. The first photo is the cover shown in the catalog."
            }
          >
            <ProductImagesInput images={images} onChange={handleImagesChange} error={imagesError} />
          </Section>

          {type === "READY" ? (
            <Section
              id="pricing"
              title="Variants, price & stock"
              description={
                isEdit
                  ? "Edit stock to the amount you have now. Orders placed while you edit are counted automatically."
                  : "Each variant has its own price and stock, e.g. sizes S, M, L, XL for Round Bouquet."
              }
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
                {isEdit ? "Status" : "Publish"}
              </h2>

              {isEdit && (
                <fieldset className="flex flex-col gap-2">
                  <legend className="sr-only">Product status</legend>
                  {STATUS_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-box border p-3 transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${
                        status === option.value ? "border-primary bg-accent-soft/30" : "border-base-300 hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={status === option.value}
                        onChange={() => setStatus(option.value)}
                        className="radio radio-primary radio-sm mt-0.5"
                      />
                      <span className="flex flex-col">
                        <span className="text-sm font-medium text-ink">{option.label}</span>
                        <span className="text-xs text-ink-muted">{option.hint}</span>
                      </span>
                    </label>
                  ))}
                </fieldset>
              )}

              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="toggle toggle-primary toggle-sm mt-0.5" {...register("isFeatured")} />
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-ink">Featured product</span>
                  <span className="text-xs text-ink-muted">Shown in &quot;Featured&quot; on the home page.</span>
                </span>
              </label>

              {/* pengumuman lonceng hanya terkirim kalau produk tampil (Active / Publish) */}
              <label className={`flex items-start gap-3 ${isEdit && status !== "ACTIVE" ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
                <input
                  type="checkbox"
                  disabled={isEdit && status !== "ACTIVE"}
                  aria-describedby="announce-hint"
                  className="toggle toggle-primary toggle-sm mt-0.5"
                  {...register("announce")}
                />
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-ink">Announce to customers</span>
                  <span id="announce-hint" className="text-xs text-ink-muted">
                    {isEdit
                      ? status === "ACTIVE"
                        ? "Send a \"New arrival\" notification when you save."
                        : "Only available when the status is Active."
                      : "Send a \"New arrival\" notification when you publish. Not sent for drafts."}
                  </span>
                </span>
              </label>

              <div className="flex flex-col gap-2 border-t border-base-300 pt-4">
                {isEdit ? (
                  <>
                    <button type="submit" disabled={isPending || isSuccess} className="btn btn-primary h-11 w-full text-[15px]">
                      {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
                      {isPending ? "Saving..." : "Save changes"}
                    </button>
                    <Link href="/admin/products" className="btn btn-ghost h-11 w-full text-[15px] text-ink">
                      Cancel
                    </Link>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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

              {/* "ikut default kategori" hanya saat tambah produk; saat edit add-on langsung dipilih */}
              {!isEdit && (
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
              )}

              {!useCategoryAddons && (
                <fieldset className={`flex flex-col gap-3 ${isEdit ? "" : "border-t border-base-300 pt-4"}`}>
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

          {/* hapus produk: dipisah di bawah sebagai zona berbahaya */}
          {product && (
            <section aria-labelledby="delete-title" className="card border border-danger-text/30 bg-base-100">
              <div className="card-body gap-3 p-6">
                <div>
                  <h2 id="delete-title" className="text-lg font-semibold text-ink">
                    Delete product
                  </h2>
                  <p className="text-sm text-ink-muted">Removes it from the catalog. Past orders keep their details.</p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsDeleteOpen(true)}
                  className="btn btn-outline h-11 w-full gap-1.5 border-danger-text text-danger-text hover:border-danger-text hover:bg-danger-soft"
                >
                  <PiTrash aria-hidden="true" size={18} />
                  Delete product
                </button>
              </div>
            </section>
          )}
        </aside>
      </form>

      {product && isDeleteOpen && (
        <DeleteProductDialog
          product={product}
          onClose={() => setIsDeleteOpen(false)}
          onDeleted={() => router.push("/admin/products")}
        />
      )}
    </div>
  );
}
