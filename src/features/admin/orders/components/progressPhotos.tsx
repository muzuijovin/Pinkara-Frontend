"use client";

import { useId, useState } from "react";
import { PiCamera } from "react-icons/pi";
import { toast } from "react-toastify";
import { ProgressPhotoGrid } from "@/components/ui/progressPhotoGrid";
import { CUSTOM_IMAGE_MAX_BYTES, CUSTOM_IMAGE_TYPES } from "@/features/validation/customRequestSchema";
import { getErrorMessage } from "@/lib/error.lib";
import type { AdminOrderDetail } from "@/types/order.type";
import { useAddProgressPhoto } from "../hooks/useAdminOrders";

const UPLOADABLE = ["DIBAYAR", "DIPRODUKSI", "SIAP_KIRIM", "DIKIRIM"];

// foto progres pesanan custom (PRD §8 no. 6): admin upload, pembeli melihat di detail pesanannya
export function ProgressPhotos({ order }: { order: AdminOrderDetail }) {
  const inputId = useId();
  const { mutate: upload, isPending } = useAddProgressPhoto(order.code);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");

  if (order.type !== "CUSTOM") return null;
  const canUpload = UPLOADABLE.includes(order.status);

  const choose = (picked: File | undefined) => {
    if (!picked) return;
    if (!CUSTOM_IMAGE_TYPES.includes(picked.type)) return toast.error("Photo must be JPG, PNG, or WebP");
    if (picked.size > CUSTOM_IMAGE_MAX_BYTES) return toast.error("Photo must be 5 MB or smaller");
    setFile(picked);
  };

  return (
    <section aria-labelledby="progress-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-4 p-5 sm:p-6">
        <header>
          <h2 id="progress-title" className="text-lg font-semibold text-ink">
            Progress photos
          </h2>
          <p className="text-sm text-ink-muted">The customer sees these on their order page.</p>
        </header>

        {order.progressPhotos.length > 0 ? (
          <ProgressPhotoGrid photos={order.progressPhotos} />
        ) : (
          <p className="text-sm text-ink-muted">No photos yet.</p>
        )}

        {canUpload && (
          <div className="flex flex-col gap-3 border-t border-base-300 pt-4 sm:flex-row sm:items-end">
            <label htmlFor={inputId} className="btn btn-outline h-11 gap-2 border-base-300 text-ink">
              <PiCamera aria-hidden="true" size={18} />
              <span className="max-w-40 truncate">{file ? file.name : "Choose photo"}</span>
              <input id={inputId} type="file" accept={CUSTOM_IMAGE_TYPES.join(",")} onChange={(event) => choose(event.target.files?.[0])} className="sr-only" />
            </label>
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor={`${inputId}-caption`} className="text-sm font-medium text-ink">
                Caption (optional)
              </label>
              <input id={`${inputId}-caption`} value={caption} maxLength={200} onChange={(event) => setCaption(event.target.value)} placeholder="e.g. Flowers arranged, wrapping next" className="input h-11 w-full text-base sm:text-sm" />
            </div>
            <button
              type="button"
              disabled={!file || isPending}
              onClick={() =>
                file &&
                upload(
                  { file, caption },
                  {
                    onSuccess: () => {
                      toast.success("Progress photo added.");
                      setFile(null);
                      setCaption("");
                    },
                    onError: (error) => toast.error(getErrorMessage(error)),
                  },
                )
              }
              className="btn btn-primary h-11"
            >
              {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
              Upload
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
