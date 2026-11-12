// link "lewati ke konten" untuk pengguna keyboard, muncul hanya saat di-focus (Tab pertama)
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-primary-content"
    >
      Skip to main content
    </a>
  );
}
