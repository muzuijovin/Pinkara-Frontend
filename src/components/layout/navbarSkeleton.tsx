// placeholder setinggi navbar asli (h-16) supaya halaman tidak "loncat" saat dirender
export function NavbarSkeleton() {
  return (
    <header aria-hidden="true" className="sticky top-0 z-40 h-16 border-b border-base-300 bg-base-100">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4 md:px-6">
        <div className="skeleton size-10 rounded-xl" />
        <div className="skeleton h-5 w-24" />
        <div className="skeleton ml-auto h-9 w-28 rounded-full" />
      </div>
    </header>
  );
}
