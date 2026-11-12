"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import { PiCamera, PiTrash } from "react-icons/pi";
import { toast } from "react-toastify";
import { UserAvatar } from "@/components/ui/userAvatar";
import { getErrorMessage } from "@/lib/error.lib";
import type { Profile } from "@/types/profile.type";
import { useRemoveAvatar, useUploadAvatar } from "../hooks/useProfile";
import { AVATAR_MAX_BYTES, AVATAR_TYPES } from "@/features/validation/profileSchema";

// foto profil: pilih file -> langsung tampil pratinjau & diupload (PATCH /users/me/avatar)
export function AvatarUploader({ profile, children }: { profile: Profile; children?: ReactNode }) {
  const [preview, setPreview] = useState<string | null>(null);
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const isBusy = upload.isPending || remove.isPending;

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // reset supaya file yang sama bisa dipilih lagi setelah gagal
    event.target.value = "";
    if (!file) return;

    if (!AVATAR_TYPES.includes(file.type)) {
      toast.error("Photo must be a JPG, PNG, or WebP file.");
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error("Photo must be 5 MB or smaller.");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    upload.mutate(file, {
      onSuccess: () => toast.success("Profile photo updated."),
      onError: (error) => toast.error(getErrorMessage(error, "Couldn't upload the photo. Please try again.")),
      onSettled: () => {
        URL.revokeObjectURL(url);
        setPreview(null);
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <UserAvatar name={profile.name} src={preview ?? profile.avatarUrl} size={112} className="text-3xl" />
        {isBusy && (
          <span
            role="status"
            className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/40"
          >
            <span aria-hidden="true" className="loading loading-spinner loading-md text-white" />
            <span className="sr-only">{upload.isPending ? "Uploading photo..." : "Removing photo..."}</span>
          </span>
        )}
      </div>

      {/* nama & email ditaruh tepat di bawah foto, sebelum tombol */}
      {children}

      <div className="flex flex-wrap justify-center gap-2">
        {/* label membungkus input file supaya tombol bisa diklik & di-Tab */}
        <label
          className={`btn btn-outline btn-primary btn-sm h-10 gap-2 px-4 ${isBusy ? "btn-disabled" : ""}`}
        >
          <PiCamera aria-hidden="true" size={18} />
          {profile.avatarUrl ? "Change photo" : "Upload photo"}
          <input
            type="file"
            accept={AVATAR_TYPES.join(",")}
            disabled={isBusy}
            onChange={handleFile}
            className="sr-only"
          />
        </label>
        {profile.avatarUrl && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              remove.mutate(undefined, {
                onSuccess: () => toast.success("Profile photo removed."),
                onError: (error) => toast.error(getErrorMessage(error)),
              })
            }
            className="btn btn-ghost btn-sm h-10 gap-2 px-4 text-danger-text hover:bg-danger-soft"
          >
            <PiTrash aria-hidden="true" size={18} />
            Remove
          </button>
        )}
      </div>
      <p className="-mt-2 text-center text-xs text-ink-muted">JPG, PNG, or WebP. Max 5 MB.</p>
    </div>
  );
}
