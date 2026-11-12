"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { PiPlus, PiTrash } from "react-icons/pi";
import { toast } from "react-toastify";
import { quotationSchema, type QuotationInput } from "@/features/validation/customRequestSchema";
import { formatRupiah } from "@/lib/currency.lib";
import { getErrorMessage } from "@/lib/error.lib";
import type { CustomRequestDetail } from "@/types/customRequest.type";
import { useAddonOptions, useCreateQuotation } from "../hooks/useAdminCustomRequests";

const inputClass = (error?: string) => `input h-10 w-full text-base sm:text-sm ${error ? "input-error" : ""}`;

// buat penawaran (PRD §8 no. 3): item + add-on dari daftar yang sama (harga normal), tanggal jadi, masa berlaku.
// Penawaran baru otomatis menggantikan yang lama
export function QuotationForm({ request, onDone }: { request: CustomRequestDetail; onDone: () => void }) {
  const { data: addonOptions = [] } = useAddonOptions();
  const { mutate, isPending } = useCreateQuotation(request.code);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<QuotationInput>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      items: [{ name: request.product?.name ?? "Custom arrangement", quantity: "1", unitPrice: request.product?.basePrice ? String(request.product.basePrice) : "" }],
      addons: [],
      readyDate: request.neededBy,
      notes: "",
      validHours: "48",
    },
  });
  const items = useFieldArray({ control, name: "items" });
  const addons = useFieldArray({ control, name: "addons" });
  const watchedItems = useWatch({ control, name: "items" });
  const watchedAddons = useWatch({ control, name: "addons" });

  const subtotal = watchedItems.reduce((total, item) => total + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const addonTotal = watchedAddons.reduce((total, row) => {
    const price = addonOptions.find((option) => option.id === row.addonId)?.price ?? 0;
    return total + price * (Number(row.quantity) || 0);
  }, 0);

  const onSubmit = (values: QuotationInput) =>
    mutate(
      {
        // add-on ditempel ke item pertama (rincian per baris tetap tampil di penawaran)
        items: values.items.map((item, index) => ({
          name: item.name,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          addons:
            index === 0
              ? values.addons.map((row) => ({ addonId: row.addonId, quantity: Number(row.quantity), giftMessage: row.giftMessage || undefined }))
              : [],
        })),
        readyDate: values.readyDate,
        notes: values.notes || undefined,
        validHours: Number(values.validHours),
      },
      {
        onSuccess: () => {
          toast.success("Quote sent to the customer.");
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error, "Couldn't send the quote.")),
      },
    );

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold text-ink">Items</legend>
        {items.fields.map((field, index) => {
          const itemErrors = errors.items?.[index];
          return (
            <div key={field.id} className="grid grid-cols-[1fr_70px_120px_auto] items-start gap-2">
              <div>
                <label htmlFor={`item-name-${index}`} className="sr-only">Item name</label>
                <input id={`item-name-${index}`} placeholder="Item name" className={inputClass(itemErrors?.name?.message)} {...register(`items.${index}.name`)} />
                {itemErrors?.name && <p className="mt-1 text-xs text-danger-text">{itemErrors.name.message}</p>}
              </div>
              <div>
                <label htmlFor={`item-qty-${index}`} className="sr-only">Quantity</label>
                <input id={`item-qty-${index}`} inputMode="numeric" placeholder="Qty" className={inputClass(itemErrors?.quantity?.message)} {...register(`items.${index}.quantity`)} />
              </div>
              <div>
                <label htmlFor={`item-price-${index}`} className="sr-only">Price (Rp)</label>
                <input id={`item-price-${index}`} inputMode="numeric" placeholder="Price (Rp)" className={`${inputClass(itemErrors?.unitPrice?.message)} tabular-nums`} {...register(`items.${index}.unitPrice`)} />
                {itemErrors?.unitPrice && <p className="mt-1 text-xs text-danger-text">{itemErrors.unitPrice.message}</p>}
              </div>
              <button
                type="button"
                disabled={items.fields.length === 1}
                onClick={() => items.remove(index)}
                aria-label={`Remove item ${index + 1}`}
                className="btn btn-ghost btn-square size-10 text-danger-text"
              >
                <PiTrash aria-hidden="true" size={16} />
              </button>
            </div>
          );
        })}
        <button type="button" onClick={() => items.append({ name: "", quantity: "1", unitPrice: "" })} className="btn btn-ghost btn-sm h-9 gap-1.5 self-start text-accent-text">
          <PiPlus aria-hidden="true" size={14} />
          Add item
        </button>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold text-ink">Add-ons (optional)</legend>
        {addons.fields.map((field, index) => {
          const selected = addonOptions.find((option) => option.id === watchedAddons[index]?.addonId);
          return (
            <div key={field.id} className="flex flex-col gap-2 rounded-box border border-base-300 p-3">
              <div className="grid grid-cols-[1fr_70px_auto] items-start gap-2">
                <div>
                  <label htmlFor={`addon-${index}`} className="sr-only">Add-on</label>
                  <select id={`addon-${index}`} className="select h-10 w-full text-base sm:text-sm" {...register(`addons.${index}.addonId`)}>
                    <option value="">Choose an add-on</option>
                    {addonOptions.map((option) => (
                      <option key={option.id} value={option.id} disabled={option.stock === 0}>
                        {option.name} · {formatRupiah(option.price)}
                        {option.stock === 0 ? " (sold out)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`addon-qty-${index}`} className="sr-only">Quantity</label>
                  <input id={`addon-qty-${index}`} inputMode="numeric" className={inputClass()} {...register(`addons.${index}.quantity`)} />
                </div>
                <button type="button" onClick={() => addons.remove(index)} aria-label={`Remove add-on ${index + 1}`} className="btn btn-ghost btn-square size-10 text-danger-text">
                  <PiTrash aria-hidden="true" size={16} />
                </button>
              </div>
              {selected?.type === "GIFT_CARD" && (
                <input placeholder="Card message (optional)" maxLength={200} className={inputClass()} {...register(`addons.${index}.giftMessage`)} />
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => addons.append({ addonId: "", quantity: "1", giftMessage: request.brief.cardMessage ?? "" })}
          className="btn btn-ghost btn-sm h-9 gap-1.5 self-start text-accent-text"
        >
          <PiPlus aria-hidden="true" size={14} />
          Add add-on
        </button>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="readyDate" className="text-sm font-medium text-ink">Ready date</label>
          <input id="readyDate" type="date" className={inputClass(errors.readyDate?.message)} {...register("readyDate")} />
          {errors.readyDate && <p className="text-xs text-danger-text">{errors.readyDate.message}</p>}
          <p className="text-xs text-ink-muted">Customer needs it by {request.neededBy}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="validHours" className="text-sm font-medium text-ink">Quote valid for</label>
          <select id="validHours" className="select h-10 w-full text-base sm:text-sm" {...register("validHours")}>
            <option value="24">24 hours</option>
            <option value="48">48 hours</option>
            <option value="72">72 hours</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="quote-notes" className="text-sm font-medium text-ink">Notes for the customer (optional)</label>
        <textarea id="quote-notes" rows={3} className="textarea w-full text-base sm:text-sm" placeholder="e.g. Includes premium wrapping and a ribbon" {...register("notes")} />
      </div>

      <div className="flex items-center justify-between rounded-box bg-surface-muted px-4 py-3">
        <span className="text-sm text-ink-muted">Total (before shipping)</span>
        <span className="text-lg font-bold tabular-nums text-accent-text">{formatRupiah(subtotal + addonTotal)}</span>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onDone} className="btn btn-ghost h-11 text-ink">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn btn-primary h-11">
          {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
          {isPending ? "Sending..." : "Send quote"}
        </button>
      </div>
    </form>
  );
}
