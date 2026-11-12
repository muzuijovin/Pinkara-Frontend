import type { ReactNode } from "react";

type SubmitButtonProps = {
  isPending: boolean;
  pendingLabel: string;
  children: ReactNode;
  className?: string;
};

// tombol submit: disabled + spinner selama request berjalan (cegah klik dobel)
export function SubmitButton({ isPending, pendingLabel, children, className = "" }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      aria-busy={isPending}
      className={`btn btn-primary h-11 w-full text-[15px] ${className}`}
    >
      {isPending && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
      {isPending ? pendingLabel : children}
    </button>
  );
}
