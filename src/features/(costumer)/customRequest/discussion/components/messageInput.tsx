"use client";

import Image from "next/image";
import { useId, useState, type KeyboardEvent } from "react";
import { PiImageSquare, PiPaperPlaneRight, PiX } from "react-icons/pi";
import { toast } from "react-toastify";
import {
  CUSTOM_IMAGE_MAX_BYTES,
  CUSTOM_IMAGE_TYPES,
  MAX_MESSAGE_ATTACHMENTS,
} from "@/features/validation/customRequestSchema";

// pesan yang dikirim + URL pratinjau lampiran (dipakai untuk menampilkan pesan "Sending…" seketika)
export type OutgoingMessage = { body: string; attachments: File[]; previewUrls: string[] };

type MessageInputProps = {
  // restore = kembalikan teks & lampiran ke kolom ketik (dipanggil saat gagal terkirim)
  onSend: (message: OutgoingMessage, restore: () => void) => void;
  isPending: boolean;
  disabledReason?: string; // mis. request sudah dibatalkan
};

const BODY_MAX = 2000;

// kirim pesan + lampiran (maks 3 gambar). Enter = kirim, Shift+Enter = baris baru.
// Kolom langsung dikosongkan saat kirim (pesan tampil seketika di daftar); gagal -> isi dikembalikan
export function MessageInput({ onSend, isPending, disabledReason }: MessageInputProps) {
  const inputId = useId();
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<{ id: string; file: File; url: string }[]>([]);

  if (disabledReason) {
    return <p className="border-t border-base-300 px-4 py-3 text-center text-sm text-ink-muted">{disabledReason}</p>;
  }

  const canSend = (body.trim().length > 0 || files.length > 0) && !isPending;

  const send = () => {
    if (!canSend) return;
    const sentBody = body;
    const sentFiles = files;
    setBody("");
    setFiles([]);
    onSend({ body: sentBody, attachments: sentFiles.map((item) => item.file), previewUrls: sentFiles.map((item) => item.url) }, () => {
      setBody(sentBody);
      setFiles(sentFiles);
    });
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const file of Array.from(list)) {
      if (!CUSTOM_IMAGE_TYPES.includes(file.type)) toast.error(`${file.name}: must be JPG, PNG, or WebP`);
      else if (file.size > CUSTOM_IMAGE_MAX_BYTES) toast.error(`${file.name}: larger than 5 MB`);
      else if (next.length >= MAX_MESSAGE_ATTACHMENTS) toast.error(`Up to ${MAX_MESSAGE_ATTACHMENTS} photos per message`);
      else next.push({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) });
    }
    setFiles(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col gap-2 border-t border-base-300 p-3 sm:p-4">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((item, index) => (
            <div key={item.id} className="relative size-16 overflow-hidden rounded-lg bg-surface-muted">
              <Image src={item.url} alt={`Attachment ${index + 1}`} fill unoptimized sizes="64px" className="object-cover" />
              <button
                type="button"
                onClick={() => setFiles(files.filter((other) => other.id !== item.id))}
                aria-label={`Remove attachment ${index + 1}`}
                className="absolute right-0.5 top-0.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <PiX aria-hidden="true" size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <label
          htmlFor={inputId}
          aria-label="Attach photos"
          className={`btn btn-ghost btn-square size-11 shrink-0 text-ink-muted ${files.length >= MAX_MESSAGE_ATTACHMENTS ? "btn-disabled" : ""}`}
        >
          <PiImageSquare aria-hidden="true" size={22} />
          <input
            id={inputId}
            type="file"
            multiple
            accept={CUSTOM_IMAGE_TYPES.join(",")}
            disabled={files.length >= MAX_MESSAGE_ATTACHMENTS}
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
            className="sr-only"
          />
        </label>
        <label htmlFor={`${inputId}-text`} className="sr-only">
          Message
        </label>
        <textarea
          id={`${inputId}-text`}
          rows={1}
          maxLength={BODY_MAX}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Write a message…"
          className="textarea min-h-11 w-full resize-none text-base leading-relaxed field-sizing-content max-h-40 sm:text-sm"
        />
        <button type="button" onClick={send} disabled={!canSend} aria-label="Send message" className="btn btn-primary btn-square size-11 shrink-0">
          {isPending ? <span aria-hidden="true" className="loading loading-spinner loading-sm" /> : <PiPaperPlaneRight aria-hidden="true" size={20} />}
        </button>
      </div>
    </div>
  );
}
