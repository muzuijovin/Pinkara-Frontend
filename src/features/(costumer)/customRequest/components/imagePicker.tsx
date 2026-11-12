"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { PiImageSquare, PiX } from "react-icons/pi";
import { toast } from "react-toastify";
import { CUSTOM_IMAGE_MAX_BYTES, CUSTOM_IMAGE_TYPES } from "@/features/validation/customRequestSchema";

export type PickedImage = { id: string; file: File; url: string };

type ImagePickerProps = {
  images: PickedImage[];
  onChange: (images: PickedImage[]) => void;
  max: number;
  label: string;
  hint?: string;
};

// pilih foto (JPG/PNG/WebP, maks 5 MB), pratinjau + hapus. Dipakai form brief & lampiran chat
export function ImagePicker({ images, onChange, max, label, hint }: ImagePickerProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const remaining = max - images.length;

  const add = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const accepted: PickedImage[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(fileList)) {
      if (!CUSTOM_IMAGE_TYPES.includes(file.type)) rejected.push(`${file.name}: must be JPG, PNG, or WebP`);
      else if (file.size > CUSTOM_IMAGE_MAX_BYTES) rejected.push(`${file.name}: larger than 5 MB`);
      else if (accepted.length >= remaining) rejected.push(`${file.name}: max ${max} photos`);
      else accepted.push({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) });
    }
    if (rejected.length) toast.error(rejected.join("\n"));
    if (accepted.length) onChange([...images, ...accepted]);
  };

  const remove = (target: PickedImage) => {
    URL.revokeObjectURL(target.url);
    onChange(images.filter((image) => image.id !== target.id));
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div key={image.id} className="relative size-24 overflow-hidden rounded-box border border-base-300 bg-surface-muted">
            <Image src={image.url} alt={`Photo ${index + 1}`} fill unoptimized sizes="96px" className="object-cover" />
            <button
              type="button"
              onClick={() => remove(image)}
              aria-label={`Remove photo ${index + 1}`}
              className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <PiX aria-hidden="true" size={14} />
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <label
            htmlFor={inputId}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              add(event.dataTransfer.files);
            }}
            className={`flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-box border-2 border-dashed text-center text-xs transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${
              isDragging ? "border-primary bg-accent-soft/40" : "border-base-300 text-ink-muted hover:border-primary/60"
            }`}
          >
            <PiImageSquare aria-hidden="true" size={22} />
            Add photo
            <input
              id={inputId}
              type="file"
              multiple
              accept={CUSTOM_IMAGE_TYPES.join(",")}
              onChange={(event) => {
                add(event.target.files);
                event.target.value = "";
              }}
              className="sr-only"
            />
          </label>
        )}
      </div>
      <span className="text-xs text-ink-muted">
        {hint ?? "JPG, PNG, or WebP · max 5 MB each"} · {images.length}/{max}
      </span>
    </div>
  );
}
