// spinner satu halaman, dipakai sebagai fallback Suspense & saat cek login
export function PageLoader() {
  return (
    <div role="status" className="flex min-h-[50vh] items-center justify-center">
      <span aria-hidden="true" className="loading loading-spinner loading-lg text-primary" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
