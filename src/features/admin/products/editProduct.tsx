"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PiPackage } from "react-icons/pi";
import { FormAlert } from "@/components/form/formAlert";
import { PageLoader } from "@/components/ui/pageLoader";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { getErrorMessage } from "@/lib/error.lib";
import { isAxiosError } from "axios";
import { ProductForm } from "./productForm";
import { useAdminProductDetail } from "./hooks/useAdminProductDetail";

// halaman edit produk (PRD §12.1c): ambil data terbaru lalu isi ProductForm
export function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isPending, isError, error, refetch, isRefetching } = useAdminProductDetail(id);
  // form baru dirender setelah kategori siap: <select> kategori diisi nilai lama saat pertama muncul,
  // kalau opsinya belum ada saat itu, pilihan kategori lama tidak tampil
  const { isPending: isLoadingCategories } = useCategories();

  if (isPending || isLoadingCategories) return <PageLoader />;

  if (isError) {
    const isNotFound = isAxiosError(error) && error.response?.status === 404;
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <PiPackage aria-hidden="true" size={44} className="text-ink-muted" />
        {isNotFound ? (
          <div>
            <h1 className="text-xl font-semibold text-ink">Product not found</h1>
            <p className="mt-1 text-sm text-ink-muted">It may have been deleted by another admin.</p>
          </div>
        ) : (
          <FormAlert message={getErrorMessage(error, "Couldn't load the product.")} />
        )}
        <div className="flex gap-2">
          {!isNotFound && (
            <button type="button" onClick={() => refetch()} className="btn btn-outline h-11">
              Try again
            </button>
          )}
          <Link href="/admin/products" className="btn btn-primary h-11">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  // produk di tab Sampah tidak bisa diedit (BE menolak), arahkan kembali
  if (product.deletedAt) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <PiPackage aria-hidden="true" size={44} className="text-ink-muted" />
        <div>
          <h1 className="text-xl font-semibold text-ink">This product was deleted</h1>
          <p className="mt-1 text-sm text-ink-muted">Deleted products can&apos;t be edited.</p>
        </div>
        <Link href="/admin/products" className="btn btn-primary h-11">
          Back to products
        </Link>
      </div>
    );
  }

  // key = version: setelah "Reload latest" data & version baru -> form diisi ulang dari awal
  return (
    <div className={isRefetching ? "pointer-events-none opacity-60" : undefined}>
      <ProductForm key={product.version} product={product} onReload={() => refetch()} />
    </div>
  );
}
