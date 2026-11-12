import Link from "next/link";
import { PiFlowerLotus } from "react-icons/pi";

// produk nonaktif / draft / dihapus -> 404 dari BE -> halaman ini, bukan error 500 (PRD §6.3)
export function ProductUnavailable() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent-text">
        <PiFlowerLotus aria-hidden="true" size={32} />
      </span>
      <div>
        <h1 className="text-2xl font-bold text-ink">Product not available</h1>
        <p className="mt-2 text-sm text-ink-muted">
          This arrangement is no longer available or the link has changed. Take a look at our other flowers.
        </p>
      </div>
      <Link href="/products" className="btn btn-primary h-11">
        Browse the catalog
      </Link>
    </div>
  );
}
