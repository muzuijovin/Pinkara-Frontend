"use client";

import { useRef } from "react";
import { PiDevices } from "react-icons/pi";
import { toast } from "react-toastify";
import { useLogoutAll } from "@/features/auth/hooks/useLogoutAll";
import { getErrorMessage } from "@/lib/error.lib";

// keluar dari semua perangkat (POST /auth/logout-all), misalnya kalau lupa logout di HP orang lain
export function LogoutAllCard() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { mutate, isPending } = useLogoutAll();

  return (
    <section aria-labelledby="sessions-title" className="card border border-base-300 bg-base-100">
      <div className="card-body flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <PiDevices aria-hidden="true" size={24} className="mt-0.5 shrink-0 text-ink-muted" />
          <div>
            <h2 id="sessions-title" className="text-lg font-semibold text-ink">
              Log out of all devices
            </h2>
            <p className="text-sm text-ink-muted">
              Ends every login session, including this device. You&apos;ll need to log in again.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="btn btn-outline h-11 shrink-0 border-danger-text text-danger-text hover:border-danger-text hover:bg-danger-soft"
        >
          Log out everywhere
        </button>
      </div>

      <dialog ref={dialogRef} aria-labelledby="logout-all-title" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 id="logout-all-title" className="text-lg font-semibold text-ink">
            Log out of all devices?
          </h3>
          <p className="mt-2 text-sm text-ink-muted">You&apos;ll also be logged out of this device.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost h-11 text-ink">Cancel</button>
            </form>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                mutate(undefined, {
                  onSuccess: () => toast.success("You've been logged out of all devices."),
                  onError: (error) => toast.error(getErrorMessage(error)),
                })
              }
              className="btn btn-error h-11"
            >
              {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
              {isPending ? "Logging out..." : "Yes, log out everywhere"}
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
