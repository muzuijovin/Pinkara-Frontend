"use client";

import Link from "next/link";
import { redirect, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { PiCaretRight } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { categoryHref } from "@/features/categories/hooks/useCategories";
import { getErrorMessage } from "@/lib/error.lib";
import { useAddToCart } from "@/features/(costumer)/cart/hooks/useCart";
import { useSession } from "@/features/auth/hooks/useSession";
import type { CartAddonsPayload } from "@/types/cart.type";
import type { ProductDetail } from "@/types/product.type";
import { AddOnsSelector, EMPTY_ADDONS, packagingOptionsFor, type AddonSelection } from "./components/addOnsSelector";
import { CustomOrderCta } from "./components/customOrderCta";
import { giftMessageError } from "./components/giftCardForm";
import { ProductGallery } from "./components/productGallery";
import { ProductInfoTabs } from "./components/productInfoTabs";
import { ProductSummary } from "./components/productSummary";
import { ProductUnavailable } from "./components/productUnavailable";
import { QuantityActions } from "./components/quantityActions";
import { RelatedProducts } from "./components/relatedProducts";
import { TrustBadges } from "./components/trustBadges";
import { VariantSelector } from "./components/variantSelector";
import { isNotFoundError, useProductDetail } from "./hooks/useProductDetail";

type Variant = ProductDetail["variants"][number];

// varian awal: yang pertama masih ada stok
const defaultVariant = (product: ProductDetail) =>
  product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];

function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product" className="grid gap-8 lg:grid-cols-2">
      <div className="skeleton aspect-square w-full" />
      <div className="flex flex-col gap-4">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-9 w-3/4" />
        <div className="skeleton h-10 w-40" />
        <div className="skeleton h-16 w-full" />
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-12 w-full" />
      </div>
    </div>
  );
}

// form pembelian produk ready stock: varian, add-on, jumlah, tombol keranjang
function ReadyStockPurchase({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const { data: user } = useSession();
  const { mutate: addItem, isPending: isAdding } = useAddToCart();

  const [variant, setVariant] = useState<Variant | undefined>(() => defaultVariant(product));
  const [quantity, setQuantity] = useState(1);
  const [addons, setAddons] = useState<AddonSelection>(EMPTY_ADDONS);

  const stock = variant?.stock ?? 0;
  const packaging = product.addons.find((addon) => addon.id === addons.packaging.addonId);
  const paperBag = product.addons.find((addon) => addon.type === "PAPER_BAG");
  const giftCard = product.addons.find((addon) => addon.type === "GIFT_CARD");
  const giftError = addons.giftCard.enabled ? giftMessageError(addons.giftCard.message) : undefined;

  // total = (harga varian + kardus) x jumlah + paper bag + 1 gift card per baris keranjang
  const total =
    ((variant?.price ?? 0) + (addons.packaging.enabled && packaging ? packaging.price : 0)) * quantity +
    (addons.paperBag.enabled && paperBag ? paperBag.price * addons.paperBag.quantity : 0) +
    (addons.giftCard.enabled && giftCard ? giftCard.price : 0);

  const changeVariant = (next: Variant) => {
    setVariant(next);
    setQuantity((current) => Math.max(1, Math.min(current, next.stock)));

    // PRD §6.3: ganti varian -> kardus ikut ukuran baru; kalau ukuran itu habis, add-on kardus dilepas
    if (addons.packaging.enabled) {
      const options = packagingOptionsFor(product.addons, next.packageSize);
      const match = options.find((addon) => addon.stock > 0);
      if (match) {
        setAddons((current) => ({ ...current, packaging: { enabled: true, addonId: match.id } }));
      } else {
        setAddons((current) => ({ ...current, packaging: { enabled: false, addonId: null } }));
        toast.info(`The packaging box for size ${next.label} is sold out, so it was removed.`);
      }
    }
  };

  const changeQuantity = (next: number) => {
    setQuantity(next);
    // paper bag maks = jumlah produk + 2 (PRD §4.4)
    setAddons((current) => ({
      ...current,
      paperBag: { ...current.paperBag, quantity: Math.min(current.paperBag.quantity, next + 2) },
    }));
  };

  // pilihan add-on -> format BE (POST /cart/items). Aturan kardus / paper bag / gift card dicek ulang BE
  const buildAddons = (): CartAddonsPayload => ({
    packagingId: addons.packaging.enabled ? addons.packaging.addonId : null,
    paperBagQuantity: addons.paperBag.enabled ? addons.paperBag.quantity : null,
    giftCard: addons.giftCard.enabled
      ? {
          message: addons.giftCard.message.trim(),
          senderName: addons.giftCard.anonymous ? "" : addons.giftCard.senderName.trim(),
          hideSender: addons.giftCard.anonymous,
        }
      : null,
  });

  // keranjang disimpan di akun -> tamu login dulu, lalu kembali ke produk ini
  const addToCart = (onAdded: () => void) => {
    if (!variant || stock === 0 || giftError) return;
    if (!user) {
      toast.info("Log in to add items to your cart.");
      router.push(`/login?redirect=${encodeURIComponent(`/products/${product.slug}`)}`);
      return;
    }
    addItem(
      { variantId: variant.id, quantity, addons: buildAddons() },
      {
        onSuccess: onAdded,
        onError: (err) => toast.error(getErrorMessage(err, "Couldn't add to cart. Please try again.")),
      },
    );
  };

  const isAdmin = user?.role === "ADMIN";
  const disabledReason =
    stock === 0 ? "This size is sold out. Choose another size." : isAdmin ? "Admin accounts can't shop. Log in as a customer to buy." : giftError;

  const showVariants = product.variants.length > 1 || product.variants[0]?.label !== "Default";

  return (
    <>
      <ProductSummary product={product} selectedVariant={variant} />

      {showVariants && variant && (
        <VariantSelector variants={product.variants} selectedId={variant.id} onSelect={changeVariant} />
      )}

      {stock > 0 && (
        <AddOnsSelector
          addons={product.addons}
          productSize={variant?.packageSize ?? null}
          quantity={quantity}
          value={addons}
          onChange={setAddons}
        />
      )}

      <div className="border-t border-base-300 pt-4">
        <QuantityActions
          quantity={quantity}
          maxQuantity={Math.max(1, stock)}
          total={total}
          disabled={stock === 0 || isAdmin || Boolean(giftError)}
          isPending={isAdding}
          disabledReason={disabledReason}
          onQuantityChange={changeQuantity}
          onAddToCart={() =>
            addToCart(() => {
              toast.success(`"${product.name}" was added to your cart.`);
              setAddons(EMPTY_ADDONS);
            })
          }
          onBuyNow={() => addToCart(() => router.push("/cart"))}
        />
      </div>
    </>
  );
}

// halaman detail produk (PRD §6.3, Figma 1:2 desktop & 1:3674 mobile)
export function ProductDetailSection() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isPending, isError, error, refetch } = useProductDetail(slug);

  // slug lama (produk sudah diganti nama) -> BE mengembalikan produknya, URL diganti ke slug baru
  if (product && product.slug !== slug) redirect(`/products/${product.slug}`);

  if (isError && isNotFoundError(error)) return <ProductUnavailable />;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
        <Link href="/" className="rounded hover:text-ink hover:underline">
          Home
        </Link>
        <PiCaretRight aria-hidden="true" size={12} />
        <Link href="/products" className="rounded hover:text-ink hover:underline">
          Catalog
        </Link>
        {product && (
          <>
            <PiCaretRight aria-hidden="true" size={12} />
            <Link href={categoryHref(product.category.slug)} className="rounded hover:text-ink hover:underline">
              {product.category.name}
            </Link>
            <PiCaretRight aria-hidden="true" size={12} />
            <span aria-current="page" className="line-clamp-1 text-ink">
              {product.name}
            </span>
          </>
        )}
      </nav>

      {isPending && <DetailSkeleton />}

      {isError && (
        <div className="flex flex-col gap-3">
          <FormAlert message={getErrorMessage(error, "Couldn't load this product.")} />
          <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
            Try again
          </button>
        </div>
      )}

      {product && (
        <div className="flex flex-col gap-10">
          <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
            <div className="flex flex-col gap-4 lg:sticky lg:top-24">
              <ProductGallery
                images={product.images}
                name={product.name}
                badge={
                  <span
                    className={`badge border-none font-medium ${
                      product.type === "CUSTOM" ? "bg-accent-soft text-accent-text" : "bg-success-soft text-success-text"
                    }`}
                  >
                    {product.type === "CUSTOM" ? "Custom Order" : "Ready Stock"}
                  </span>
                }
              />
              <TrustBadges />
            </div>

            <div className="card border border-base-300 bg-base-100">
              <div className="card-body gap-6 p-5 sm:p-6">
                {product.type === "CUSTOM" ? (
                  <>
                    <ProductSummary product={product} />
                    <CustomOrderCta slug={product.slug} />
                  </>
                ) : (
                  // key: pilihan varian/add-on di-reset kalau pindah ke produk lain (mis. dari produk terkait)
                  <ReadyStockPurchase key={product.id} product={product} />
                )}
              </div>
            </div>
          </div>

          <ProductInfoTabs product={product} />
          <RelatedProducts product={product} />
        </div>
      )}
    </div>
  );
}
