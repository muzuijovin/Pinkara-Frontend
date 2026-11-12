"use client";

import { useRef, useState } from "react";
import { PiMapPinLine, PiPencilSimple, PiPlus, PiStar, PiTrash } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { getErrorMessage } from "@/lib/error.lib";
import type { Address } from "@/types/profile.type";
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from "../hooks/useAddresses";
import { AddressForm } from "./addressForm";

// sama dengan batas di BE (addresses.service.ts)
const MAX_ADDRESSES = 10;

// tab "Alamat": daftar alamat pengiriman + tambah / ubah / hapus / jadikan utama
export function AddressList() {
  const { data: addresses = [], isPending, error, refetch } = useAddresses();
  const setDefault = useSetDefaultAddress();
  const remove = useDeleteAddress();

  // modal pakai <dialog> bawaan browser: fokus terkunci di modal & Esc menutup
  const formDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);

  const openForm = (target: Address | "new") => {
    setEditing(target);
    formDialogRef.current?.showModal();
  };
  const closeForm = () => formDialogRef.current?.close();

  const openDelete = (address: Address) => {
    setDeleting(address);
    deleteDialogRef.current?.showModal();
  };

  const isFull = addresses.length >= MAX_ADDRESSES;

  return (
    <section aria-labelledby="address-title" className="card border border-base-300 bg-base-100">
      <div className="card-body gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="address-title" className="text-lg font-semibold text-ink">
              Shipping addresses
            </h2>
            <p className="text-sm text-ink-muted">
              Your default address is selected automatically at checkout. Up to {MAX_ADDRESSES} addresses.
            </p>
          </div>
          <button
            type="button"
            disabled={isFull || isPending}
            onClick={() => openForm("new")}
            className="btn btn-primary h-11 gap-2"
          >
            <PiPlus aria-hidden="true" size={18} />
            Add address
          </button>
        </div>

        {isPending && (
          <div className="grid gap-3" aria-busy="true">
            <div className="skeleton h-32 w-full" />
            <div className="skeleton h-32 w-full" />
          </div>
        )}

        {error && (
          <div className="flex flex-col gap-3">
            <FormAlert message={getErrorMessage(error, "Couldn't load your addresses.")} />
            <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
              Try again
            </button>
          </div>
        )}

        {!isPending && !error && addresses.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-box border border-dashed border-base-300 px-6 py-10 text-center">
            <PiMapPinLine aria-hidden="true" size={36} className="text-ink-muted" />
            <div>
              <p className="font-medium text-ink">No addresses yet</p>
              <p className="text-sm text-ink-muted">Add an address for a faster checkout.</p>
            </div>
          </div>
        )}

        <ul className="grid gap-3">
          {addresses.map((address) => (
            <li
              key={address.id}
              className={`rounded-box border p-4 ${address.isDefault ? "border-primary bg-accent-soft/30" : "border-base-300"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                {address.label && <span className="font-semibold text-ink">{address.label}</span>}
                {address.isDefault && (
                  <span className="badge badge-sm border-none bg-primary text-primary-content">Default</span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-ink">
                {address.recipientName} <span className="font-normal text-ink-muted">· {address.recipientPhone}</span>
              </p>
              <p className="mt-1 wrap-break-word text-sm text-ink-muted">
                {address.fullAddress}, {address.city} {address.postalCode}
              </p>

              <div className="mt-3 flex flex-wrap gap-1">
                {!address.isDefault && (
                  <button
                    type="button"
                    disabled={setDefault.isPending}
                    onClick={() =>
                      setDefault.mutate(address.id, {
                        onSuccess: () => toast.success("Default address updated."),
                        onError: (err) => toast.error(getErrorMessage(err)),
                      })
                    }
                    className="btn btn-ghost btn-sm h-10 gap-1.5 text-ink"
                  >
                    <PiStar aria-hidden="true" size={16} />
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openForm(address)}
                  className="btn btn-ghost btn-sm h-10 gap-1.5 text-ink"
                  aria-label={`Edit address: ${address.label ?? address.recipientName}`}
                >
                  <PiPencilSimple aria-hidden="true" size={16} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => openDelete(address)}
                  className="btn btn-ghost btn-sm h-10 gap-1.5 text-danger-text hover:bg-danger-soft"
                  aria-label={`Delete address: ${address.label ?? address.recipientName}`}
                >
                  <PiTrash aria-hidden="true" size={16} />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* modal tambah / ubah alamat */}
      <dialog
        ref={formDialogRef}
        aria-labelledby="address-dialog-title"
        onClose={() => setEditing(null)}
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box max-h-[90dvh] max-w-xl">
          <h3 id="address-dialog-title" className="mb-4 text-lg font-semibold text-ink">
            {editing === "new" ? "Add address" : "Edit address"}
          </h3>
          {editing && (
            <AddressForm
              // key: form di-reset setiap ganti alamat yang diubah
              key={editing === "new" ? "new" : editing.id}
              address={editing === "new" ? undefined : editing}
              isFirstAddress={addresses.length === 0}
              onDone={closeForm}
              onCancel={closeForm}
            />
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close">close</button>
        </form>
      </dialog>

      {/* konfirmasi hapus */}
      <dialog
        ref={deleteDialogRef}
        aria-labelledby="delete-dialog-title"
        onClose={() => setDeleting(null)}
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box">
          <h3 id="delete-dialog-title" className="text-lg font-semibold text-ink">
            Delete this address?
          </h3>
          {deleting && (
            <p className="mt-2 text-sm text-ink-muted">
              The address <strong className="text-ink">{deleting.label ?? deleting.recipientName}</strong> will be deleted.
              {deleting.isDefault && " Your most recent other address will become the default."}
            </p>
          )}
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost h-11 text-ink">Cancel</button>
            </form>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() =>
                deleting &&
                remove.mutate(deleting.id, {
                  onSuccess: () => {
                    toast.success("Address deleted.");
                    deleteDialogRef.current?.close();
                  },
                  onError: (err) => toast.error(getErrorMessage(err)),
                })
              }
              className="btn btn-error h-11"
            >
              {remove.isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
              {remove.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close">close</button>
        </form>
      </dialog>
    </section>
  );
}
