"use client";

import Image from "next/image";
import { useId, useMemo } from "react";
import { PiImageSquare, PiTrash, PiUploadSimple } from "react-icons/pi";
import { toast } from "react-toastify";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

type SingleImageInputProps = {
  label: string;
  currentUrl: string | null; // foto yang sudah tersimpan
  file: File | null; // foto baru yang belum diupload
  removed: boolean; // foto tersimpan ditandai untuk dihapus
  onFileChange: (file: File | null) => void;
  onRemovedChange: (removed: boolean) => void;
};

// 1 foto opsional (JPG/PNG/WebP maks 5 MB) dengan pratinjau, ganti & hapus. Dipakai form add-on & kategori
export function SingleImageInput({ label, currentUrl, file, removed, onFileChange, onRemovedChange }: SingleImageInputProps) {
  const inputId = useId();
  // URL pratinjau hanya dibuat saat file berganti (bukan di setiap render)
  const fileUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const preview = fileUrl ?? (removed ? null : currentUrl);

  const choose = (picked?: File) => {
    if (!picked) return;
    if (!TYPES.includes(picked.type)) return toast.error("Photo must be JPG, PNG, or WebP");
    if (picked.size > MAX_BYTES) return toast.error("Photo must be 5 MB or smaller");
    onFileChange(picked);
    onRemovedChange(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="flex items-center gap-4">
        <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-box border border-base-300 bg-surface-muted">
          {preview ? (
            <Image src={preview} alt="" fill unoptimized={Boolean(file)} sizes="80px" className="object-cover" />
          ) : (
            <PiImageSquare aria-hidden="true" size={24} className="text-ink-muted" />
          )}
        </span>
        <div className="flex flex-wrap gap-2">
          <label htmlFor={inputId} className="btn btn-outline btn-sm h-10 gap-1.5 border-base-300 text-ink">
            <PiUploadSimple aria-hidden="true" size={16} />
            {preview ? "Change photo" : "Upload photo"}
            <input id={inputId} type="file" accept={TYPES.join(",")} onChange={(event) => choose(event.target.files?.[0])} className="sr-only" />
          </label>
          {preview && (
            <button
              type="button"
              onClick={() => {
                onFileChange(null);
                if (currentUrl) onRemovedChange(true);
              }}
              className="btn btn-ghost btn-sm h-10 gap-1.5 text-danger-text hover:bg-danger-soft"
            >
              <PiTrash aria-hidden="true" size={16} />
              Remove
            </button>
          )}
        </div>
      </div>
      <span className="text-xs text-ink-muted">Optional · JPG, PNG, or WebP · max 5 MB</span>
    </div>
  );
}
