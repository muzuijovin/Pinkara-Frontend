import Image from "next/image";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import type { ProgressPhoto } from "@/types/order.type";

// galeri foto progres pesanan custom (dipakai detail pesanan pembeli & admin)
export function ProgressPhotoGrid({ photos }: { photos: ProgressPhoto[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo, index) => (
        <li key={photo.url} className="overflow-hidden rounded-box border border-base-300 bg-base-100">
          <a href={photo.url} target="_blank" rel="noreferrer" aria-label={`Open progress photo ${index + 1}`} className="relative block aspect-square bg-surface-muted">
            <Image src={photo.url} alt={photo.caption ?? `Progress photo ${index + 1}`} fill sizes="(min-width: 640px) 200px, 45vw" className="object-cover" />
          </a>
          <div className="p-2 text-xs">
            {photo.caption && <p className="text-ink wrap-break-word">{photo.caption}</p>}
            <p className="text-ink-muted">{formatDateTimeWIB(photo.uploadedAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
