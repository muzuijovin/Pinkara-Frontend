import type { ProductDetail } from "@/types/product.type";

// deskripsi + spesifikasi (Figma 1:262). Deskripsi = HTML sederhana yang SUDAH disanitasi BE
// (sanitize-html saat simpan produk), jadi aman di-render sebagai HTML
export function ProductInfoTabs({ product }: { product: ProductDetail }) {
  const specs = [
    { label: "Category", value: product.category.name },
    { label: "Dimensions", value: product.dimensions },
    { label: "Materials", value: product.materials },
    {
      label: "Production time",
      value: product.type === "CUSTOM" && product.productionDays ? `${product.productionDays} days` : null,
    },
    { label: "Type", value: product.type === "CUSTOM" ? "Custom / pre-order" : "Ready stock" },
  ].filter((spec): spec is { label: string; value: string } => Boolean(spec.value));

  return (
    <section aria-labelledby="about-product" className="card border border-base-300 bg-base-100">
      <div className="card-body grid gap-8 p-6 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 id="about-product" className="text-lg font-semibold text-ink">
            About this arrangement
          </h2>
          <div
            className="mt-3 max-w-prose text-sm leading-relaxed text-ink-muted [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:mt-2"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>

        <div className="rounded-box bg-accent-soft/30 p-5">
          <h3 className="text-sm font-semibold text-ink">Specifications</h3>
          <dl className="mt-3 divide-y divide-base-300 text-sm">
            {specs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-4 py-2.5">
                <dt className="text-ink-muted">{spec.label}</dt>
                <dd className="text-right font-medium text-ink">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
