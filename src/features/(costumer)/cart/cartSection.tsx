"use client";

import Link from "next/link";
import { useRef } from "react";
import { PiShoppingCartSimple } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { useSession } from "@/features/auth/hooks/useSession";
import { getErrorMessage } from "@/lib/error.lib";
import { CartItemCard } from "./components/cartItemCard";
import { CartSummary } from "./components/cartSummary";
import { useCart, useClearCart } from "./hooks/useCart";

const STEPS = ["Cart", "Shipping", "Payment"];

// langkah belanja (Figma: Cart -> Alamat & Jadwal -> Pembayaran), keranjang = langkah 1
function CheckoutSteps() {
  return (
    <ol aria-label="Checkout steps" className="flex items-center gap-2 text-sm">
      {STEPS.map((step, index) => {
        const current = index === 0;
        return (
          <li key={step} aria-current={current ? "step" : undefined} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true" className="h-px w-6 bg-base-300 sm:w-10" />}
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                current ? "bg-primary text-primary-content" : "bg-surface-sunken text-ink-muted"
              }`}
            >
              {index + 1}
            </span>
            <span className={current ? "font-semibold text-ink" : "text-ink-muted"}>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

function CartSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading cart" className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
      <div className="card border border-base-300 bg-base-100 p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-4 py-3">
            <div className="skeleton size-20 shrink-0" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-10 w-32" />
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton h-72 w-full" />
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="card border border-base-300 bg-base-100">
      <div className="card-body items-center gap-3 px-6 py-14 text-center">
        <PiShoppingCartSimple aria-hidden="true" size={44} className="text-ink-muted" />
        <div>
          <h2 className="text-lg font-semibold text-ink">Your cart is empty</h2>
          <p className="text-sm text-ink-muted">Find a bouquet or gift you love and add it here.</p>
        </div>
        <Link href="/products" className="btn btn-primary h-11">
          Browse the catalog
        </Link>
      </div>
    </div>
  );
}

// halaman keranjang (PRD §7): daftar item + add-on per item, ubah jumlah, hapus, ringkasan & checkout
export function CartSection() {
  const { data: user } = useSession();
  const { data: cart, isPending, isError, error, refetch } = useCart();
  const { mutate: clearCart, isPending: isClearing } = useClearCart();
  const clearDialogRef = useRef<HTMLDialogElement>(null);

  // akun admin tidak punya keranjang (useCart tidak berjalan untuk admin)
  if (user && user.role !== "CUSTOMER") {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-ink">Cart is for customers</h1>
        <p className="mt-1 text-sm text-ink-muted">Admin accounts can&apos;t shop. Log in with a customer account to buy.</p>
        <Link href="/admin" className="btn btn-primary mt-4 h-11">
          Go to admin dashboard
        </Link>
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <CheckoutSteps />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink md:text-3xl">Shopping cart</h1>
          {cart && items.length > 0 && (
            <p className="mt-1 text-sm text-ink-muted">
              {cart.summary.itemCount} {cart.summary.itemCount === 1 ? "item" : "items"}
            </p>
          )}
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => clearDialogRef.current?.showModal()}
            className="btn btn-ghost btn-sm h-10 text-ink-muted hover:text-danger-text"
          >
            Clear cart
          </button>
        )}
      </div>

      <div className="mt-6">
        {isPending && <CartSkeleton />}

        {isError && (
          <div className="flex flex-col gap-3">
            <FormAlert message={getErrorMessage(error, "Couldn't load your cart.")} />
            <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm self-start">
              Try again
            </button>
          </div>
        )}

        {cart && items.length === 0 && <EmptyCart />}

        {cart && items.length > 0 && (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col gap-4">
              <section aria-label="Cart items" className="card border border-base-300 bg-base-100">
                <ul className="divide-y divide-base-300">
                  {items.map((item) => (
                    <CartItemCard key={item.id} item={item} />
                  ))}
                </ul>
              </section>
              <Link href="/products" className="self-start text-sm font-medium text-accent-text hover:underline">
                ← Continue shopping
              </Link>
            </div>

            <CartSummary cart={cart} />
          </div>
        )}
      </div>

      {/* konfirmasi kosongkan keranjang: <dialog> bawaan -> fokus terkunci & Esc menutup */}
      <dialog ref={clearDialogRef} aria-labelledby="clear-cart-title" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 id="clear-cart-title" className="text-lg font-semibold text-ink">
            Clear your cart?
          </h3>
          <p className="mt-2 text-sm text-ink-muted">All items and their add-ons will be removed.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost h-11 text-ink">Cancel</button>
            </form>
            <button
              type="button"
              disabled={isClearing}
              onClick={() =>
                clearCart(undefined, {
                  onSuccess: () => {
                    clearDialogRef.current?.close();
                    toast.success("Your cart is now empty.");
                  },
                  onError: (err) => toast.error(getErrorMessage(err, "Couldn't clear your cart.")),
                })
              }
              className="btn btn-error h-11"
            >
              {isClearing && <span aria-hidden="true" className="loading loading-spinner loading-sm" />}
              {isClearing ? "Clearing..." : "Yes, clear cart"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close">close</button>
        </form>
      </dialog>
    </div>
  );
}
