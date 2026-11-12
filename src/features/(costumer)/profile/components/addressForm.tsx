"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { SubmitButton } from "@/components/form/submitButton";
import { TextField } from "@/components/form/textField";
import { getErrorMessage } from "@/lib/error.lib";
import type { Address } from "@/types/profile.type";
import { useCreateAddress, useUpdateAddress } from "../hooks/useAddresses";
import { addressSchema } from "@/features/validation/profileSchema";

type AddressFormProps = {
  address?: Address; // ada = mode ubah, kosong = tambah baru
  isFirstAddress: boolean;
  onDone: () => void;
  onCancel: () => void;
};

// form tambah / ubah alamat (dipakai di dalam modal)
export function AddressForm({ address, isFirstAddress, onDone, onCancel }: AddressFormProps) {
  const create = useCreateAddress();
  const update = useUpdateAddress();
  const mutation = address ? update : create;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address?.label ?? "",
      recipientName: address?.recipientName ?? "",
      recipientPhone: address?.recipientPhone ?? "",
      fullAddress: address?.fullAddress ?? "",
      city: address?.city ?? "",
      postalCode: address?.postalCode ?? "",
      isDefault: address?.isDefault ?? isFirstAddress,
    },
  });

  const onSuccess = () => {
    toast.success(address ? "Address updated." : "Address added.");
    onDone();
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        address
          ? update.mutate({ id: address.id, input: values }, { onSuccess })
          : create.mutate(values, { onSuccess }),
      )}
      className="flex flex-col gap-4"
    >
      {mutation.error && <FormAlert message={getErrorMessage(mutation.error)} />}

      <TextField
        id="label"
        label="Address label (optional)"
        placeholder="Home, Office, Apartment..."
        error={errors.label?.message}
        {...register("label")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="recipientName"
          label="Recipient name"
          autoComplete="name"
          required
          error={errors.recipientName?.message}
          {...register("recipientName")}
        />
        <TextField
          id="recipientPhone"
          type="tel"
          label="Recipient phone number"
          inputMode="tel"
          autoComplete="tel"
          placeholder="081234567890"
          required
          error={errors.recipientPhone?.message}
          {...register("recipientPhone")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullAddress" className="text-sm font-medium text-ink">
          Full address
          <span aria-hidden="true" className="text-danger-text">
            {" "}
            *
          </span>
        </label>
        <textarea
          id="fullAddress"
          rows={3}
          autoComplete="street-address"
          placeholder="Street name, house number, RT/RW, district, landmark"
          aria-required
          aria-invalid={errors.fullAddress ? true : undefined}
          aria-describedby={errors.fullAddress ? "fullAddress-error" : undefined}
          className={`textarea w-full text-base sm:text-sm ${errors.fullAddress ? "textarea-error" : ""}`}
          {...register("fullAddress")}
        />
        {errors.fullAddress && (
          <p id="fullAddress-error" className="text-xs text-danger-text">
            {errors.fullAddress.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="city"
          label="City / Regency"
          autoComplete="address-level2"
          required
          error={errors.city?.message}
          {...register("city")}
        />
        <TextField
          id="postalCode"
          label="Postal code"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          required
          error={errors.postalCode?.message}
          {...register("postalCode")}
        />
      </div>

      {/* alamat utama tidak bisa dicabut dari sini, pilih alamat lain sebagai utama */}
      {!address?.isDefault && (
        <label className="flex cursor-pointer items-center gap-3 py-1 text-sm text-ink">
          <input type="checkbox" className="checkbox checkbox-primary" {...register("isDefault")} />
          Set as default address
        </label>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn btn-ghost h-11 text-ink">
          Cancel
        </button>
        <SubmitButton isPending={mutation.isPending} pendingLabel="Saving..." className="sm:w-auto sm:px-8">
          {address ? "Save changes" : "Save address"}
        </SubmitButton>
      </div>
    </form>
  );
}
