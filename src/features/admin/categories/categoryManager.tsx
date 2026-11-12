"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PiArrowDown, PiArrowUp, PiPencilSimple, PiPlus, PiSquaresFour, PiTrash } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { SingleImageInput } from "@/components/form/singleImageInput";
import { TextField } from "@/components/form/textField";
import { categorySchema, type CategoryInput } from "@/features/validation/catalogSchema";
import { ADDON_TYPES } from "@/features/validation/productSchema";
import { getErrorMessage } from "@/lib/error.lib";
import type { AdminCategory } from "@/types/catalog.type";
import type { AddonType } from "@/types/product.type";
import { useAdminCategories, useDeleteCategory, useReorderCategories, useSaveCategory } from "./hooks/useAdminCategories";

const ADDON_LABEL: Record<AddonType, string> = { PACKAGING: "Packaging box", PAPER_BAG: "Paper bag", GIFT_CARD: "Gift card" };

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <dialog
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      onClose={onClose}
      aria-labelledby="category-dialog-title"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="modal-box">
        <h3 id="category-dialog-title" className="text-lg font-semibold text-ink">
          {title}
        </h3>
        {children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close">close</button>
      </form>
    </dialog>
  );
}

// tambah / edit kategori: nama, foto, aktif, add-on default untuk produk baru
function CategoryDialog({ category, onClose }: { category?: AdminCategory; onClose: () => void }) {
  const { mutate, isPending, error } = useSaveCategory();
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      isActive: category?.isActive ?? true,
      defaultAddonTypes: category?.defaultAddonTypes ?? [...ADDON_TYPES],
    },
  });

  const onSubmit = (values: CategoryInput) =>
    mutate(
      { id: category?.id, values, image, removeImage },
      {
        onSuccess: () => {
          toast.success(category ? "Category updated." : "Category added.");
          onClose();
        },
      },
    );

  return (
    <ModalShell title={category ? "Edit category" : "Add category"} onClose={onClose}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
        {error && <FormAlert message={getErrorMessage(error, "Couldn't save the category.")} />}
        <TextField
          id="category-name"
          label="Name"
          required
          placeholder="e.g. Bloom Box"
          hint={category ? `Link stays /products?kategori=${category.slug}` : undefined}
          error={errors.name?.message}
          {...register("name")}
        />
        <SingleImageInput label="Photo" currentUrl={category?.imageUrl ?? null} file={image} removed={removeImage} onFileChange={setImage} onRemovedChange={setRemoveImage} />
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-ink">Default add-ons for new products</legend>
          {ADDON_TYPES.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input type="checkbox" value={type} className="checkbox checkbox-primary checkbox-sm" {...register("defaultAddonTypes")} />
              {ADDON_LABEL[type]}
            </label>
          ))}
        </fieldset>
        <label className="flex cursor-pointer items-start gap-3 border-t border-base-300 pt-4">
          <input type="checkbox" className="toggle toggle-primary toggle-sm mt-0.5" {...register("isActive")} />
          <span className="flex flex-col">
            <span className="text-sm font-medium text-ink">Visible to buyers</span>
            <span className="text-xs text-ink-muted">Hidden categories also hide their products from the catalog.</span>
          </span>
        </label>
        <div className="modal-action mt-0">
          <button type="button" onClick={onClose} disabled={isPending} className="btn btn-ghost h-11 text-ink">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="btn btn-primary h-11">
            {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
            {category ? "Save changes" : "Add category"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function DeleteDialog({ category, onClose }: { category: AdminCategory; onClose: () => void }) {
  const { mutate, isPending } = useDeleteCategory();
  const blocked = category.productCount > 0;
  return (
    <ModalShell title={`Delete ${category.name}?`} onClose={onClose}>
      <p className="mt-2 text-sm text-ink-muted">
        {blocked
          ? `This category still has ${category.productCount} product(s). Move or delete them first, or hide the category instead.`
          : "It will be removed from the catalog and navigation."}
      </p>
      <div className="modal-action">
        <button type="button" onClick={onClose} className="btn btn-ghost h-11 text-ink">
          {blocked ? "OK" : "Cancel"}
        </button>
        {!blocked && (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              mutate(category.id, {
                onSuccess: () => {
                  toast.success(`${category.name} was deleted.`);
                  onClose();
                },
                onError: (error) => toast.error(getErrorMessage(error)),
              })
            }
            className="btn btn-error h-11"
          >
            {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
            Delete
          </button>
        )}
      </div>
    </ModalShell>
  );
}

// kelola kategori (PRD §12): urutan tampil, foto, aktif/nonaktif, add-on default, tambah/edit/hapus
export function CategoryManager() {
  const { data: categories, isPending, isError, error, refetch } = useAdminCategories();
  const { mutate: reorder, isPending: isSavingOrder } = useReorderCategories();
  // urutan yang sedang diatur (null = sama dengan server)
  const [draftOrder, setDraftOrder] = useState<string[] | null>(null);
  const [editing, setEditing] = useState<AdminCategory | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);

  const byId = new Map(categories?.map((category) => [category.id, category]));
  const ordered = draftOrder ? draftOrder.map((id) => byId.get(id)).filter((c): c is AdminCategory => Boolean(c)) : (categories ?? []);

  const move = (index: number, direction: -1 | 1) => {
    const ids = ordered.map((category) => category.id);
    [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
    setDraftOrder(ids);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink md:text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-ink-muted">The order here is the order buyers see on the home page and catalog.</p>
        </div>
        <button type="button" onClick={() => setEditing("new")} className="btn btn-primary h-11 gap-2">
          <PiPlus aria-hidden="true" size={18} />
          Add category
        </button>
      </div>

      {draftOrder && (
        <div role="status" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-box bg-accent-soft/50 px-4 py-3">
          <p className="text-sm text-ink">You changed the order.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDraftOrder(null)} disabled={isSavingOrder} className="btn btn-ghost btn-sm h-9 text-ink">
              Reset
            </button>
            <button
              type="button"
              disabled={isSavingOrder}
              onClick={() =>
                reorder(draftOrder, {
                  onSuccess: () => {
                    toast.success("Order saved.");
                    setDraftOrder(null);
                  },
                  onError: (err) => toast.error(getErrorMessage(err)),
                })
              }
              className="btn btn-primary btn-sm h-9"
            >
              {isSavingOrder && <span aria-hidden="true" className="loading loading-spinner loading-xs" />}
              Save order
            </button>
          </div>
        </div>
      )}

      {isPending && <div className="skeleton mt-6 h-80 w-full" />}
      {isError && (
        <div className="mt-6 flex flex-col gap-3">
          <FormAlert message={getErrorMessage(error, "Couldn't load categories.")} />
          <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
            Try again
          </button>
        </div>
      )}

      {categories && (
        <ol className="card mt-6 divide-y divide-base-300 border border-base-300 bg-base-100">
          {ordered.map((category, index) => (
            <li key={category.id} className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${category.isActive ? "" : "opacity-60"}`}>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex flex-col">
                  {/* paling atas tidak bisa naik / paling bawah tidak bisa turun: tombolnya disembunyikan
                      (invisible = tempat tetap ada supaya baris tidak bergeser) */}
                  <button
                    type="button"
                    disabled={index === 0}
                    aria-hidden={index === 0 || undefined}
                    onClick={() => move(index, -1)}
                    aria-label={`Move ${category.name} up`}
                    className={`btn btn-ghost btn-square btn-xs size-7 text-ink-muted ${index === 0 ? "invisible" : ""}`}
                  >
                    <PiArrowUp aria-hidden="true" size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={index === ordered.length - 1}
                    aria-hidden={index === ordered.length - 1 || undefined}
                    onClick={() => move(index, 1)}
                    aria-label={`Move ${category.name} down`}
                    className={`btn btn-ghost btn-square btn-xs size-7 text-ink-muted ${index === ordered.length - 1 ? "invisible" : ""}`}
                  >
                    <PiArrowDown aria-hidden="true" size={14} />
                  </button>
                </div>
                <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                  {category.imageUrl ? <Image src={category.imageUrl} alt="" fill sizes="56px" className="object-cover" /> : <PiSquaresFour aria-hidden="true" size={22} className="text-ink-muted" />}
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
                    {category.name}
                    {!category.isActive && <span className="badge badge-sm border-none bg-surface-sunken text-ink-muted">Hidden</span>}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {category.productCount} {category.productCount === 1 ? "product" : "products"} · /{category.slug}
                  </p>
                  <p className="text-xs text-ink-muted">
                    Default add-ons: {category.defaultAddonTypes.length ? category.defaultAddonTypes.map((type) => ADDON_LABEL[type]).join(", ") : "none"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-1">
                <button type="button" onClick={() => setEditing(category)} aria-label={`Edit ${category.name}`} className="btn btn-ghost btn-sm h-9 gap-1.5 text-ink">
                  <PiPencilSimple aria-hidden="true" size={16} />
                  Edit
                </button>
                <button type="button" onClick={() => setDeleting(category)} aria-label={`Delete ${category.name}`} className="btn btn-ghost btn-square btn-sm size-9 text-danger-text hover:bg-danger-soft">
                  <PiTrash aria-hidden="true" size={16} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {editing && <CategoryDialog category={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
      {deleting && <DeleteDialog category={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}
