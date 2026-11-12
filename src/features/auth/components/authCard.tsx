import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
};

// kartu di tengah halaman auth (login, daftar, lupa/reset password, verifikasi)
export function AuthCard({ title, description, icon, children, footer }: AuthCardProps) {
  return (
    <div className="flex justify-center px-4 py-10 sm:py-16">
      <section className="card w-full max-w-md border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-6 p-6 sm:p-8">
          <header className="flex flex-col gap-2">
            {icon && (
              <span
                aria-hidden="true"
                className="mb-2 flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent-text"
              >
                {icon}
              </span>
            )}
            <h1 className="text-2xl font-bold text-ink">{title}</h1>
            {description && <p className="text-sm leading-relaxed text-ink-muted">{description}</p>}
          </header>
          {children}
        </div>
        {footer && (
          <div className="border-t border-base-300 px-6 py-4 text-center text-sm text-ink-muted sm:px-8">
            {footer}
          </div>
        )}
      </section>
    </div>
  );
}

export const authLinkClass =
  "cursor-pointer rounded font-semibold text-accent-text underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
