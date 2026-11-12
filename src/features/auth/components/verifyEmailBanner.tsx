import { PiWarningCircle } from "react-icons/pi";
import { ResendVerificationButton } from "./resendVerificationButton";

// pengingat di bawah navbar untuk user yang emailnya belum diverifikasi (PRD §5: wajib sebelum checkout)
export function VerifyEmailBanner() {
  return (
    <div role="status" className="border-t border-warning/40 bg-warning/15">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 text-sm text-ink sm:flex-row sm:items-center sm:justify-between md:px-6">
        <p className="flex items-start gap-2">
          <PiWarningCircle aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
          Your email isn&apos;t verified yet. Verify it to check out and place custom orders.
        </p>
        <ResendVerificationButton className="btn-ghost btn-sm h-9 shrink-0 self-start px-2 text-accent-text underline-offset-4 hover:bg-transparent hover:underline sm:self-auto" />
      </div>
    </div>
  );
}
