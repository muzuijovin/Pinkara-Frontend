"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PiArrowLeft, PiPaperPlaneTilt } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { TextareaField } from "@/components/form/textareaField";
import { TextField } from "@/components/form/textField";
import { useProductDetail } from "@/features/(public)/productDetail/hooks/useProductDetail";
import {
  briefSchema,
  CUSTOM_MIN_LEAD_DAYS,
  MAX_REFERENCE_IMAGES,
  wibDateOffset,
  type BriefInput,
} from "@/features/validation/customRequestSchema";
import { formatRupiah } from "@/lib/currency.lib";
import { getErrorMessage } from "@/lib/error.lib";
import { ImagePicker, type PickedImage } from "./components/imagePicker";
import { useCreateCustomRequest } from "./hooks/useCustomRequests";

// form brief custom (PRD §6.3, §8 no. 1): ukuran, warna, bunga, tulisan kartu, tanggal dibutuhkan (min H+3),
// foto referensi maks 5. ?product=<slug> = dibuka dari halaman produk custom
export function BriefForm() {
  const router = useRouter();
  const productSlug = useSearchParams().get("product") ?? "";
  const { data: product } = useProductDetail(productSlug);
  const { mutate, isPending, error } = useCreateCustomRequest();
  const [images, setImages] = useState<PickedImage[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BriefInput>({
    resolver: zodResolver(briefSchema),
    defaultValues: { size: "", colors: "", flowers: "", cardMessage: "", notes: "", budget: "", neededBy: "" },
  });
  const cardMessage = useWatch({ control, name: "cardMessage" });
  const notes = useWatch({ control, name: "notes" });
  const minDate = wibDateOffset(CUSTOM_MIN_LEAD_DAYS);
  const customProduct = product?.type === "CUSTOM" ? product : undefined;

  const onSubmit = (values: BriefInput) =>
    mutate(
      { ...values, productId: customProduct?.id, images: images.map((image) => image.file) },
      {
        onSuccess: (request) => {
          toast.success("Brief sent! Our florist will reply soon.");
          router.push(`/custom-requests/${request.code}`);
        },
      },
    );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <Link href={customProduct ? `/products/${customProduct.slug}` : "/custom-order"} className="inline-flex items-center gap-1.5 rounded text-sm text-ink-muted hover:text-ink">
        <PiArrowLeft aria-hidden="true" size={16} />
        Back
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink md:text-3xl">Tell us about your custom order</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Share your idea and our florist will chat with you, then send a quote. No payment until you accept it.
      </p>

      {customProduct && (
        <div className="mt-5 flex items-center gap-3 rounded-box border border-base-300 bg-base-100 p-3">
          <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
            {customProduct.images[0] && <Image src={customProduct.images[0]} alt="" fill sizes="56px" className="object-cover" />}
          </span>
          <div className="min-w-0">
            <p className="text-xs text-ink-muted">Based on</p>
            <p className="line-clamp-1 font-semibold text-ink">{customProduct.name}</p>
            {customProduct.basePrice && <p className="text-xs text-accent-text">Starting from {formatRupiah(customProduct.basePrice)}</p>}
          </div>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-6">
        {error && <FormAlert message={getErrorMessage(error, "Couldn't send your brief. Please try again.")} />}

        <section aria-labelledby="brief-design" className="card border border-base-300 bg-base-100">
          <div className="card-body gap-5 p-5 sm:p-6">
            <h2 id="brief-design" className="text-lg font-semibold text-ink">
              Your design
            </h2>
            <TextField id="size" label="Size" required placeholder="e.g. Medium, about 40 cm tall" error={errors.size?.message} {...register("size")} />
            <TextField id="colors" label="Colors" required placeholder="e.g. Soft pink and white" error={errors.colors?.message} {...register("colors")} />
            <TextField
              id="flowers"
              label="Flowers"
              required
              placeholder="e.g. Roses, baby's breath, eucalyptus"
              error={errors.flowers?.message}
              {...register("flowers")}
            />
            <TextareaField
              id="notes"
              label="Anything else? (optional)"
              rows={3}
              placeholder="Occasion, style you like, things to avoid…"
              count={{ value: notes.length, max: 1000 }}
              error={errors.notes?.message}
              {...register("notes")}
            />
            <ImagePicker
              images={images}
              onChange={setImages}
              max={MAX_REFERENCE_IMAGES}
              label="Reference photos (optional)"
              hint="Photos of styles you like help our florist a lot. JPG, PNG, or WebP · max 5 MB each"
            />
          </div>
        </section>

        <section aria-labelledby="brief-details" className="card border border-base-300 bg-base-100">
          <div className="card-body gap-5 p-5 sm:p-6">
            <h2 id="brief-details" className="text-lg font-semibold text-ink">
              Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="neededBy"
                type="date"
                label="Needed by"
                required
                min={minDate}
                hint={`At least ${CUSTOM_MIN_LEAD_DAYS} days from today`}
                error={errors.neededBy?.message}
                {...register("neededBy")}
              />
              <TextField
                id="budget"
                label="Budget in Rp (optional)"
                inputMode="numeric"
                placeholder="500000"
                error={errors.budget?.message}
                {...register("budget")}
              />
            </div>
            <TextareaField
              id="cardMessage"
              label="Gift card message (optional)"
              rows={2}
              maxLength={200}
              placeholder="Write the message for the card, if you want one"
              count={{ value: cardMessage.length, max: 200 }}
              error={errors.cardMessage?.message}
              {...register("cardMessage")}
            />
          </div>
        </section>

        <button type="submit" disabled={isPending} className="btn btn-primary h-12 gap-2 text-[15px] sm:self-end sm:px-8">
          {isPending ? <span aria-hidden="true" className="loading loading-spinner loading-sm" /> : <PiPaperPlaneTilt aria-hidden="true" size={18} />}
          {isPending ? "Sending..." : "Send brief"}
        </button>
      </form>
    </div>
  );
}
