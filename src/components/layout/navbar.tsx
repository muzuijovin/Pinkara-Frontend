import { Suspense } from "react";
import { NavbarLanding } from "@/features/navbar/navbarLanding";
import { NavbarSkeleton } from "./navbarSkeleton";

// sementara selalu navbar landing; NavbarUser dipasang setelah endpoint auth (GET /auth/me) siap
// usePathname di dalam navbar butuh Suspense karena cacheComponents aktif
// dan ada route dinamis (mis. /products/[slug]) yang pathname-nya baru diketahui saat request
export default function Navbar() {
  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <NavbarLanding />
    </Suspense>
  );
}
