"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PiArrowLeft, PiArrowRight, PiEye, PiEyeSlash, PiImages, PiPencilSimple, PiPlus, PiTrash } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { SingleImageInput } from "@/components/form/singleImageInput";
import { gallerySchema, type GalleryInput } from "@/features/validation/gallerySchema";
import { getErrorMessage } from "@/lib/error.lib";
import type { AdminGalleryItem } from "@/types/gallery.type";
import { useAdminGallery, useDeleteGalleryItem, useReorderGallery, useSaveGalleryItem, useToggleGalleryItem } from "./hooks/useAdminGallery";

// sama dengan BE: maks 30 foto tersimpan, landing menampilkan 12 foto tampil pertama
const MAX_ITEMS = 30;
const LANDING_LIMIT = 12;

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <dialog
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      onClose={onClose}
      aria-labelledby="gallery-dialog-title"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="modal-box">
        <h3 id="gallery-dialog-title" className="text-lg font-semibold text-ink">
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

// tambah / edit foto: foto (wajib saat tambah), caption, tampil di landing
function GalleryDialog({ item, onClose }: { item?: AdminGalleryItem; onClose: () => void }) {
  const { mutate, isPending, error } = useSaveGalleryItem();
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GalleryInput>({
    resolver: zodResolver(gallerySchema),
    defaultValues: { caption: item?.caption ?? "", isActive: item?.isActive ?? true },
  });
  const captionLength = useWatch({ control, name: "caption" })?.length ?? 0;

  const onSubmit = (values: GalleryInput) => {
    if (!item && !image) return setImageError("Please choose a photo");
    mutate(
      { id: item?.id, values, image },
      {
        onSuccess: () => {
          toast.success(item ? "Photo updated." : "Photo added.");
          onClose();
        },
      },
    );
  };

  return (
    <ModalShell title={item ? "Edit photo" : "Add photo"} onClose={onClose}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
        {error && <FormAlert message={getErrorMessage(error, "Couldn't save the photo.")} />}
        <SingleImageInput
          label="Photo"
          required
          currentUrl={item?.imageUrl ?? null}
          file={image}
          removed={false}
          onFileChange={(file) => {
            setImage(file);
            if (file) setImageError(undefined);
          }}
          onRemovedChange={() => undefined}
          error={imageError}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="gallery-caption" className="text-sm font-medium text-ink">
            Caption
          </label>
          <textarea
            id="gallery-caption"
            rows={3}
            placeholder="e.g. Pastel bouquet for a graduation"
            aria-invalid={Boolean(errors.caption) || undefined}
            aria-describedby="gallery-caption-hint"
            className={`textarea w-full text-base ${errors.caption ? "textarea-error" : ""}`}
            {...register("caption")}
          />
          <span id="gallery-caption-hint" className={`text-xs ${errors.caption ? "text-danger-text" : "text-ink-muted"}`}>
            {errors.caption?.message ?? `Optional · shown under the photo · ${captionLength}/255`}
          </span>
        </div>
        <label className="flex cursor-pointer items-start gap-3 border-t border-base-300 pt-4">
          <input type="checkbox" className="toggle toggle-primary toggle-sm mt-0.5" {...register("isActive")} />
          <span className="flex flex-col">
            <span className="text-sm font-medium text-ink">Show on home page</span>
            <span className="text-xs text-ink-muted">Hidden photos stay here but buyers won&apos;t see them.</span>
          </span>
        </label>
        <div className="modal-action mt-0">
          <button type="button" onClick={onClose} disabled={isPending} className="btn btn-ghost h-11 text-ink">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="btn btn-primary h-11">
            {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
            {item ? "Save changes" : "Add photo"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function DeleteDialog({ item, onClose }: { item: AdminGalleryItem; onClose: () => void }) {
  const { mutate, isPending } = useDeleteGalleryItem();
  return (
    <ModalShell title="Delete this photo?" onClose={onClose}>
      <div className="mt-3 flex items-center gap-3">
        <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
          <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />
        </span>
        <p className="text-sm text-ink-muted">It will be removed from the gallery permanently. To keep it for later, hide it instead.</p>
      </div>
      <div className="modal-action">
        <button type="button" onClick={onClose} disabled={isPending} className="btn btn-ghost h-11 text-ink">
          Cancel
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            mutate(item.id, {
              onSuccess: () => {
                toast.success("Photo deleted.");
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
      </div>
    </ModalShell>
  );
}

type CardProps = {
  item: AdminGalleryItem;
  index: number;
  total: number;
  onLanding: boolean;
  onMove: (direction: -1 | 1) => void;
  onEdit: () => void;
  onDelete: () => void;
};

function GalleryCard({ item, index, total, onLanding, onMove, onEdit, onDelete }: CardProps) {
  const { mutate: toggle, isPending: isToggling } = useToggleGalleryItem();
  const name = item.caption ?? `photo ${index + 1}`;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <li className="card overflow-hidden border border-base-300 bg-base-100">
      <div className="relative aspect-square bg-surface-muted">
        <Image src={item.imageUrl} alt={item.caption ?? ""} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className={`object-cover ${item.isActive ? "" : "opacity-50 grayscale"}`} />
        <span className="badge badge-sm absolute top-2 left-2 border-none bg-base-100/90 font-medium text-ink tabular-nums">#{index + 1}</span>
        {!item.isActive ? (
          <span className="badge badge-sm absolute top-2 right-2 gap-1 border-none bg-base-100/90 text-ink-muted">
            <PiEyeSlash aria-hidden="true" size={12} />
            Hidden
          </span>
        ) : (
          !onLanding && <span className="badge badge-sm absolute top-2 right-2 border-none bg-base-100/90 text-ink-muted">Not on home page</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3">
        <p className={`line-clamp-2 text-sm ${item.caption ? "text-ink" : "text-ink-muted italic"}`}>{item.caption ?? "No caption"}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-1">
          {/* geser posisi: pengganti drag & drop yang bisa dipakai keyboard / layar sentuh */}
          <div className="flex">
            <button
              type="button"
              disabled={isFirst}
              aria-hidden={isFirst || undefined}
              onClick={() => onMove(-1)}
              aria-label={`Move ${name} earlier`}
              className={`btn btn-ghost btn-square btn-sm size-9 text-ink-muted ${isFirst ? "invisible" : ""}`}
            >
              <PiArrowLeft aria-hidden="true" size={16} />
            </button>
            <button
              type="button"
              disabled={isLast}
              aria-hidden={isLast || undefined}
              onClick={() => onMove(1)}
              aria-label={`Move ${name} later`}
              className={`btn btn-ghost btn-square btn-sm size-9 text-ink-muted ${isLast ? "invisible" : ""}`}
            >
              <PiArrowRight aria-hidden="true" size={16} />
            </button>
          </div>
          <div className="flex">
            <button
              type="button"
              disabled={isToggling}
              onClick={() =>
                toggle(
                  { id: item.id, isActive: !item.isActive },
                  {
                    onSuccess: (updated) => toast.success(updated.isActive ? "Photo is now shown." : "Photo hidden."),
                    onError: (error) => toast.error(getErrorMessage(error)),
                  },
                )
              }
              aria-label={item.isActive ? `Hide ${name}` : `Show ${name}`}
              title={item.isActive ? "Hide" : "Show"}
              className="btn btn-ghost btn-square btn-sm size-9 text-ink"
            >
              {isToggling ? (
                <span aria-hidden="true" className="loading loading-spinner loading-xs" />
              ) : item.isActive ? (
                <PiEyeSlash aria-hidden="true" size={16} />
              ) : (
                <PiEye aria-hidden="true" size={16} />
              )}
            </button>
            <button type="button" onClick={onEdit} aria-label={`Edit ${name}`} title="Edit" className="btn btn-ghost btn-square btn-sm size-9 text-ink">
              <PiPencilSimple aria-hidden="true" size={16} />
            </button>
            <button type="button" onClick={onDelete} aria-label={`Delete ${name}`} title="Delete" className="btn btn-ghost btn-square btn-sm size-9 text-danger-text hover:bg-danger-soft">
              <PiTrash aria-hidden="true" size={16} />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

// kelola galeri hasil karya (PRD §6.1, §12): urutan = urutan di landing, tampil/sembunyi, tambah/edit/hapus
export function GalleryManager() {
  const { data: items, isPending, isError, error, refetch } = useAdminGallery();
  const { mutate: reorder, isPending: isSavingOrder } = useReorderGallery();
  // urutan yang sedang diatur (null = sama dengan server)
  const [draftOrder, setDraftOrder] = useState<string[] | null>(null);
  const [editing, setEditing] = useState<AdminGalleryItem | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminGalleryItem | null>(null);

  const byId = new Map(items?.map((item) => [item.id, item]));
  const ordered = draftOrder ? draftOrder.map((id) => byId.get(id)).filter((item): item is AdminGalleryItem => Boolean(item)) : (items ?? []);
  // 12 foto tampil pertama yang muncul di landing
  const landingIds = new Set(ordered.filter((item) => item.isActive).slice(0, LANDING_LIMIT).map((item) => item.id));
  const visibleCount = ordered.filter((item) => item.isActive).length;
  const isFull = (items?.length ?? 0) >= MAX_ITEMS;

  const move = (index: number, direction: -1 | 1) => {
    const ids = ordered.map((item) => item.id);
    [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
    setDraftOrder(ids);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink md:text-3xl">Gallery</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Photos of your work on the home page. The first {LANDING_LIMIT} shown photos appear, in this order.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button type="button" onClick={() => setEditing("new")} disabled={isFull || isPending} className="btn btn-primary h-11 gap-2">
            <PiPlus aria-hidden="true" size={18} />
            Add photo
          </button>
          {items && (
            <span className="text-xs text-ink-muted tabular-nums">
              {isFull ? `Gallery is full (${MAX_ITEMS}). Delete a photo first.` : `${items.length} of ${MAX_ITEMS} photos · ${visibleCount} shown`}
            </span>
          )}
        </div>
      </div>

      {draftOrder && (
        <div role="status" className="sticky top-2 z-10 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-box bg-accent-soft px-4 py-3 shadow-sm">
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

      {isPending && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="skeleton aspect-3/4 w-full" />
          ))}
        </div>
      )}
      {isError && (
        <div className="mt-6 flex flex-col gap-3">
          <FormAlert message={getErrorMessage(error, "Couldn't load the gallery.")} />
          <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
            Try again
          </button>
        </div>
      )}

      {items && items.length === 0 && (
        <div className="card mt-6 flex flex-col items-center gap-3 border border-dashed border-base-300 bg-base-100 px-6 py-14 text-center">
          <PiImages aria-hidden="true" size={36} className="text-ink-muted" />
          <p className="font-medium text-ink">No photos yet</p>
          <p className="max-w-sm text-sm text-ink-muted">Add photos of bouquets you&apos;ve made. They show up in the gallery section of the home page.</p>
          <button type="button" onClick={() => setEditing("new")} className="btn btn-primary btn-sm mt-2 h-10 gap-2">
            <PiPlus aria-hidden="true" size={16} />
            Add the first photo
          </button>
        </div>
      )}

      {items && items.length > 0 && (
        <ol className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {ordered.map((item, index) => (
            <GalleryCard
              key={item.id}
              item={item}
              index={index}
              total={ordered.length}
              onLanding={landingIds.has(item.id)}
              onMove={(direction) => move(index, direction)}
              onEdit={() => setEditing(item)}
              onDelete={() => setDeleting(item)}
            />
          ))}
        </ol>
      )}

      {editing && <GalleryDialog item={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
      {deleting && <DeleteDialog item={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}
