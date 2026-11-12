"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PiArrowRight, PiChatsCircle, PiCreditCard, PiHandHeart, PiPencilSimpleLine, PiReceipt } from "react-icons/pi";
import { formatRupiah } from "@/lib/currency.lib";
import { axiosInstance } from "@/lib/axios-instance.lib";
import type { ApiListResponse } from "@/types/api-response.type";
import type { ProductCardItem } from "@/types/product.type";

const STEPS = [
  { icon: PiPencilSimpleLine, title: "Send your brief", text: "Size, colors, flowers, the date you need it, and reference photos." },
  { icon: PiChatsCircle, title: "Chat with our florist", text: "We refine the idea together, right here on the website." },
  { icon: PiReceipt, title: "Get a quote", text: "Price and ready date, valid for 48 hours." },
  { icon: PiCreditCard, title: "Accept & pay", text: "Pay in full with QRIS or bank transfer to lock it in." },
  { icon: PiHandHeart, title: "We craft & deliver", text: "See progress photos, then receive your piece." },
];

// produk CUSTOM sebagai inspirasi / pintu masuk brief (PRD §4.2)
function useCustomProducts() {
  return useQuery({
    queryKey: ["products", "custom-order-page"],
    queryFn: async () => {
      const res = await axiosInstance.get<ApiListResponse<ProductCardItem>>("/products", { params: { type: "CUSTOM", limit: 8 } });
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// halaman Custom Order (PRD §4.2, §8): alur 5 langkah + produk custom per kategori + mulai brief
export function CustomOrderPage() {
  const { data: products } = useCustomProducts();

  return (
    <div className="flex flex-col gap-14 pb-16 md:gap-20">
      <section className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 pt-10 md:px-6 md:pt-14 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <p className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-text">Custom order</p>
          <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-balance text-ink sm:text-5xl">
            Your idea, arranged by our florists
          </h1>
          <p className="max-w-[48ch] text-base leading-relaxed text-ink-muted sm:text-lg">
            Tell us what you have in mind: a color story, a favorite flower, a special date. We&apos;ll chat it through and send you a quote.
            No payment until you accept.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/custom-requests/new" className="btn btn-primary h-12 gap-2 px-6 text-[15px]">
              Start your brief
              <PiArrowRight aria-hidden="true" size={18} />
            </Link>
            <Link href="/custom-requests" className="btn btn-outline btn-primary h-12 px-6 text-[15px]">
              My custom requests
            </Link>
          </div>
          <p className="text-xs text-ink-muted">Please order at least 3 days before you need it.</p>
        </div>
        <div className="relative aspect-4/3 overflow-hidden rounded-4xl shadow-lg">
          <Image src="/images/categories/flower-canvas.webp" alt="Pressed flower artwork made by hand" fill priority sizes="(min-width: 1024px) 45vw, 92vw" className="object-cover" />
        </div>
      </section>

      <section aria-labelledby="custom-steps-title" className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <h2 id="custom-steps-title" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          How it works
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="card border border-base-300 bg-base-100">
              <div className="card-body gap-3 p-5">
                <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                  <Icon aria-hidden="true" size={22} />
                </span>
                <p className="text-xs font-semibold text-accent-text">Step {index + 1}</p>
                <p className="font-semibold text-ink">{title}</p>
                <p className="text-sm leading-relaxed text-ink-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {products && products.length > 0 && (
        <section aria-labelledby="custom-products-title" className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <h2 id="custom-products-title" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Start from one of our pieces
          </h2>
          <p className="mt-1 text-sm text-ink-muted">Pick a style as a starting point, then make it yours.</p>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {products.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/custom-requests/new?product=${encodeURIComponent(product.slug)}`}
                  className="group card overflow-hidden border border-base-300 bg-base-100 transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="relative aspect-square bg-surface-muted">
                    {product.images[0] && <Image src={product.images[0]} alt="" fill sizes="(min-width: 768px) 22vw, 46vw" className="object-cover" />}
                  </span>
                  <span className="flex flex-col gap-0.5 p-3">
                    <span className="text-xs text-ink-muted">{product.category.name}</span>
                    <span className="line-clamp-1 font-semibold text-ink">{product.name}</span>
                    <span className="text-sm text-accent-text">From {formatRupiah(product.minPrice)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
