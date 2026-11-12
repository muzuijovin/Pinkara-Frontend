"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PiCaretRight } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { SingleImageInput } from "@/components/form/singleImageInput";
import { TextField } from "@/components/form/textField";
import { PageLoader } from "@/components/ui/pageLoader";
import { addonSchema, type AddonInput } from "@/features/validation/catalogSchema";
import { ADDON_TYPES, PRODUCT_SIZES } from "@/features/validation/productSchema";
import { getErrorMessage } from "@/lib/error.lib";
import type { AdminAddon } from "@/types/catalog.type";
import { ADDON_TYPE_INFO } from "./addonTable";
import { useAdminAddons, useCreateAddon, useUpdateAddon } from "./hooks/useAdminAddons";

function Form({ addon }: { addon?: AdminAddon }) {
  const router = useRouter();
  const create = useCreateAddon();
  const update = useUpdateAddon();
  const mutation = addon ? update : create;
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddonInput>({
    resolver: zodResolver(addonSchema),
    defaultValues: addon
      ? {
          name: addon.name,
          type: addon.type,
          size: addon.size ?? "",
          price: String(addon.price),
          stock: String(addon.stock),
          lowStockThreshold: String(addon.lowStockThreshold),
          isActive: addon.isActive,
        }
      : { name: "", type: "PACKAGING", size: "", price: "", stock: "0", lowStockThreshold: "1", isActive: true },
  });
  const type = useWatch({ control, name: "type" });

  const onSuccess = (saved: unknown, verb: string) => {
    toast.success(`${(saved as AdminAddon).name} was ${verb}.`);
    router.push("/admin/addons");
  };

  const onSubmit = (values: AddonInput) =>
    addon
      ? update.mutate({ addon, values, image, removeImage }, { onSuccess: (saved) => onSuccess(saved, "updated") })
      : create.mutate({ values, image }, { onSuccess: (saved) => onSuccess(saved, "added") });

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-sm text-ink-muted">
        <Link href="/admin/addons" className="rounded hover:text-ink hover:underline">
          Add-ons
        </Link>
        <PiCaretRight aria-hidden="true" size={12} />
        <span aria-current="page" className="text-ink">
          {addon ? addon.name : "Add add-on"}
        </span>
      </nav>
      <h1 className="text-2xl font-bold text-ink md:text-3xl">{addon ? "Edit add-on" : "Add add-on"}</h1>
      {addon && <p className="mt-1 text-sm text-ink-muted">Stock is changed with the Stock button on the add-ons list.</p>}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="card mt-6 border border-base-300 bg-base-100">
        <div className="card-body gap-5 p-5 sm:p-6">
          {mutation.error && <FormAlert message={getErrorMessage(mutation.error, "Couldn't save the add-on.")} />}

          <fieldset disabled={Boolean(addon)} className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-ink">Type</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {ADDON_TYPES.map((value) => {
                const { label, icon: Icon } = ADDON_TYPE_INFO[value];
                return (
                  <label
                    key={value}
                    className={`flex items-center gap-2 rounded-box border p-3 text-sm has-focus-visible:outline-2 has-focus-visible:outline-primary ${
                      type === value ? "border-primary bg-accent-soft/30" : "border-base-300"
                    } ${addon ? (type === value ? "" : "opacity-50") : "cursor-pointer"}`}
                  >
                    <input type="radio" value={value} className="radio radio-primary radio-sm" {...register("type")} />
                    <Icon aria-hidden="true" size={18} className="text-ink-muted" />
                    {label.replace(/s$/, "")}
                  </label>
                );
              })}
            </div>
            {addon && <p className="text-xs text-ink-muted">The type can&apos;t be changed after it&apos;s created.</p>}
          </fieldset>

          <TextField id="name" label="Name" required placeholder="e.g. Kardus M" error={errors.name?.message} {...register("name")} />

          <div className="grid gap-4 sm:grid-cols-2">
            {type === "PACKAGING" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="size" className="text-sm font-medium text-ink">
                  Box size <span aria-hidden="true" className="text-danger-text">*</span>
                </label>
                <select id="size" className={`select h-11 w-full text-base sm:text-sm ${errors.size ? "select-error" : ""}`} {...register("size")}>
                  <option value="">Choose a size</option>
                  {PRODUCT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                {errors.size ? (
                  <p className="text-xs text-danger-text">{errors.size.message}</p>
                ) : (
                  <p className="text-xs text-ink-muted">Fits products of this size or smaller.</p>
                )}
              </div>
            )}
            <TextField id="price" label="Price (Rp)" required inputMode="numeric" placeholder="15000" error={errors.price?.message} {...register("price")} />
            {!addon && <TextField id="stock" label="Starting stock" required inputMode="numeric" error={errors.stock?.message} {...register("stock")} />}
            <TextField
              id="lowStockThreshold"
              label="Low-stock alert at"
              required
              inputMode="numeric"
              hint="Flagged when stock is at or below this number"
              error={errors.lowStockThreshold?.message}
              {...register("lowStockThreshold")}
            />
          </div>

          <SingleImageInput label="Photo" currentUrl={addon?.imageUrl ?? null} file={image} removed={removeImage} onFileChange={setImage} onRemovedChange={setRemoveImage} />

          <label className="flex cursor-pointer items-start gap-3 border-t border-base-300 pt-4">
            <input type="checkbox" className="toggle toggle-primary toggle-sm mt-0.5" {...register("isActive")} />
            <span className="flex flex-col">
              <span className="text-sm font-medium text-ink">Available to buyers</span>
              <span className="text-xs text-ink-muted">Only one active add-on per box size, and one paper bag and gift card.</span>
            </span>
          </label>

          <div className="flex flex-col-reverse gap-2 border-t border-base-300 pt-4 sm:flex-row sm:justify-end">
            <Link href="/admin/addons" className="btn btn-ghost h-11 text-ink">
              Cancel
            </Link>
            <button type="submit" disabled={mutation.isPending} className="btn btn-primary h-11">
              {mutation.isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
              {addon ? "Save changes" : "Add add-on"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// tambah add-on: /admin/addons/create
export function AddonForm() {
  return <Form />;
}

// edit add-on: /admin/addons/[id]/edit. Data diambil dari daftar add-on (jumlahnya sedikit)
export function EditAddonForm() {
  const { id } = useParams<{ id: string }>();
  const { data: addons, isPending } = useAdminAddons();
  if (isPending) return <PageLoader />;

  const addon = addons?.find((item) => item.id === id);
  if (!addon) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-ink">Add-on not found</h1>
        <Link href="/admin/addons" className="btn btn-primary h-11">
          Back to add-ons
        </Link>
      </div>
    );
  }
  // key = version: data terbaru setelah simpan / dari admin lain -> form diisi ulang
  return <Form key={addon.version} addon={addon} />;
}
