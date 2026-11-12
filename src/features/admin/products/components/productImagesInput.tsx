"use client";

import Image from "next/image";
import { useState, type ChangeEvent, type DragEvent } from "react";
import { PiArrowLeft, PiArrowRight, PiImageSquare, PiTrash, PiUploadSimple } from "react-icons/pi";
import { toast } from "react-toastify";
import {
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGE_TYPES,
} from "@/features/validation/productSchema";

export type ProductImage = { id: string; file: File; url: string };

type ProductImagesInputProps = {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  error?: string;
};

// foto produk 1–8 (PRD §12.1b): pilih / drag & drop, atur urutan (foto pertama = cover), hapus.
// Urutan diubah lewat tombol kiri/kanan supaya bisa juga pakai keyboard (bukan drag saja)
export function ProductImagesInput({ images, onChange, error }: ProductImagesInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const remaining = MAX_PRODUCT_IMAGES - images.length;

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const accepted: ProductImage[] = [];
    const rejected: string[] = [];

    for (const file of Array.from(fileList)) {
      if (!PRODUCT_IMAGE_TYPES.includes(file.type)) rejected.push(`${file.name}: must be JPG, PNG, or WebP`);
      else if (file.size > PRODUCT_IMAGE_MAX_BYTES) rejected.push(`${file.name}: larger than 5 MB`);
      else if (accepted.length >= remaining) rejected.push(`${file.name}: max ${MAX_PRODUCT_IMAGES} photos`);
      else accepted.push({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) });
    }

    if (rejected.length) toast.error(rejected.join("\n"));
    if (accepted.length) onChange([...images, ...accepted]);
  };

  const remove = (target: ProductImage) => {
    URL.revokeObjectURL(target.url);
    onChange(images.filter((image) => image.id !== target.id));
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = [...images];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <li key={image.id} className="overflow-hidden rounded-box border border-base-300 bg-base-100">
              <div className="relative aspect-square bg-surface-muted">
                <Image
                  src={image.url}
                  alt={`Product photo ${index + 1}`}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 200px, 45vw"
                  className="object-cover"
                />
                {index === 0 && (
                  <span className="badge badge-sm absolute left-2 top-2 border-none bg-primary text-primary-content">
                    Cover
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-1">
                <div className="flex">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Move photo ${index + 1} left`}
                    className="btn btn-ghost btn-square btn-sm size-9"
                  >
                    <PiArrowLeft aria-hidden="true" size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={index === images.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Move photo ${index + 1} right`}
                    className="btn btn-ghost btn-square btn-sm size-9"
                  >
                    <PiArrowRight aria-hidden="true" size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(image)}
                  aria-label={`Remove photo ${index + 1}`}
                  className="btn btn-ghost btn-square btn-sm size-9 text-danger-text hover:bg-danger-soft"
                >
                  <PiTrash aria-hidden="true" size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-box border-2 border-dashed px-6 py-8 text-center transition-colors duration-200 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${
            isDragging
              ? "border-primary bg-accent-soft/40"
              : error
                ? "border-danger-text/60 bg-danger-soft/30"
                : "border-base-300 hover:border-primary/60 hover:bg-surface-muted"
          }`}
        >
          {images.length ? (
            <PiUploadSimple aria-hidden="true" size={28} className="text-ink-muted" />
          ) : (
            <PiImageSquare aria-hidden="true" size={32} className="text-ink-muted" />
          )}
          <span className="text-sm font-medium text-ink">
            {images.length ? "Add more photos" : "Drag photos here, or click to browse"}
          </span>
          <span className="text-xs text-ink-muted">
            JPG, PNG, or WebP · max 5 MB each · {remaining} of {MAX_PRODUCT_IMAGES} remaining
          </span>
          <input
            type="file"
            multiple
            accept={PRODUCT_IMAGE_TYPES.join(",")}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
            aria-describedby={error ? "images-error" : undefined}
            className="sr-only"
          />
        </label>
      )}

      {error && (
        <p id="images-error" className="text-xs text-danger-text">
          {error}
        </p>
      )}
    </div>
  );
}
