"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { SubmitButton } from "@/components/form/submitButton";
import { TextField } from "@/components/form/textField";
import { getErrorMessage } from "@/lib/error.lib";
import type { Address } from "@/types/profile.type";
import { useCreateAddress, useUpdateAddress } from "../hooks/useAddresses";
import { addressSchema } from "@/features/validation/profileSchema";
import { AreaCombobox } from "@/features/shipping/components/areaCombobox";
import { LocationPicker } from "@/features/shipping/components/locationPicker";

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
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address?.label ?? "",
      recipientName: address?.recipientName ?? "",
      recipientPhone: address?.recipientPhone ?? "",
      fullAddress: address?.fullAddress ?? "",
      areaId: address?.areaId ?? "",
      areaName: address?.areaName ?? "",
      isDefault: address?.isDefault ?? isFirstAddress,
      latitude: address?.latitude ?? null,
      longitude: address?.longitude ?? null,
    },
  });
  const [latitude, longitude, areaId, areaName] = useWatch({ control, name: ["latitude", "longitude", "areaId", "areaName"] });
  // alamat lama (sebelum validasi wilayah) -> minta dilengkapi
  const needsUpdate = Boolean(address) && (!address?.areaId || address?.latitude === null);
  const pin = latitude !== null && longitude !== null ? { latitude, longitude } : null;

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
      {needsUpdate && (
        <p role="status" className="rounded-box bg-warning/15 px-3 py-2.5 text-sm text-ink">
          Please choose this address&apos;s district from the list and pin it on the map so couriers can find it.
        </p>
      )}

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

      <AreaCombobox
        value={areaId ? { id: areaId, name: areaName } : null}
        onChange={(area) => {
          setValue("areaId", area?.id ?? "", { shouldDirty: true, shouldValidate: Boolean(area) });
          setValue("areaName", area?.name ?? "", { shouldDirty: true });
        }}
        error={errors.areaId?.message}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullAddress" className="text-sm font-medium text-ink">
          Street address
          <span aria-hidden="true" className="text-danger-text">
            {" "}
            *
          </span>
        </label>
        <textarea
          id="fullAddress"
          rows={3}
          autoComplete="street-address"
          placeholder="Street name, house number, RT/RW, building, landmark"
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

      <LocationPicker
        required
        value={pin}
        error={errors.latitude?.message}
        onChange={(next) => {
          setValue("latitude", next?.latitude ?? null, { shouldDirty: true, shouldValidate: Boolean(next) });
          setValue("longitude", next?.longitude ?? null, { shouldDirty: true });
        }}
      />

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
