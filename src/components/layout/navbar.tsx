import { Suspense } from "react";
import { NavbarSwitch } from "@/features/navbar/navbarSwitch";
import { NavbarSkeleton } from "./navbarSkeleton";

// usePathname di dalam navbar butuh Suspense karena cacheComponents aktif
// dan ada route dinamis (mis. /products/[slug]) yang pathname-nya baru diketahui saat request
export default function Navbar() {
  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <NavbarSwitch />
    </Suspense>
  );
}
