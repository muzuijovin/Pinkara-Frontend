import Image from "next/image";
import { formatRupiah } from "@/lib/currency.lib";
import { formatDateWIB } from "@/lib/datetime.lib";
import type { CustomRequestDetail } from "@/types/customRequest.type";

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-sm whitespace-pre-line text-ink wrap-break-word">{value}</dd>
    </div>
  );
}

// isi brief dari pembeli + foto referensi (dipakai ruang diskusi pembeli & admin)
export function BriefSummary({ request }: { request: CustomRequestDetail }) {
  const { brief } = request;
  return (
    <section aria-labelledby="brief-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-4 p-5">
        <h2 id="brief-title" className="text-lg font-semibold text-ink">
          Brief
        </h2>
        {(request.product || request.category) && (
          <p className="text-sm text-ink-muted">
            Based on <span className="font-medium text-ink">{request.product?.name ?? request.category?.name}</span>
          </p>
        )}
        <dl className="flex flex-col gap-3">
          <Row label="Needed by" value={formatDateWIB(request.neededBy)} />
          <Row label="Size" value={brief.size} />
          <Row label="Colors" value={brief.colors} />
          <Row label="Flowers" value={brief.flowers} />
          <Row label="Card message" value={brief.cardMessage} />
          <Row label="Budget" value={brief.budget ? formatRupiah(brief.budget) : null} />
          <Row label="Notes" value={brief.notes} />
        </dl>
        {request.referenceImages.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Reference photos</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {request.referenceImages.map((url, index) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open reference photo ${index + 1}`}
                  className="relative block size-20 overflow-hidden rounded-lg bg-surface-muted"
                >
                  <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
