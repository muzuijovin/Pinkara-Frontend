import type { NextConfig } from "next";

// API lewat domain FE sendiri (online): browser memanggil https://<fe>/api/v1/..., Vercel meneruskannya ke BE.
// Cookie login jadi milik domain FE (bukan cookie pihak ketiga), jadi tidak diblokir Safari / iPhone & browser
// dengan privasi ketat. Diisi di Vercel FE: API_PROXY_TARGET=https://<be>.vercel.app + NEXT_PUBLIC_API_BASE_URL=/api/v1.
// Lokal tidak diisi -> FE memanggil BE langsung (http://localhost:8000/api/v1) seperti biasa
const API_PROXY_TARGET = process.env.API_PROXY_TARGET?.trim().replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return API_PROXY_TARGET ? [{ source: "/api/v1/:path*", destination: `${API_PROXY_TARGET}/api/v1/:path*` }] : [];
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // foto dari luar yang boleh dipakai next/image:
  // Cloudinary (upload produk & foto profil), Google (foto profil akun login Google),
  // placehold.co (foto dummy di data seed produk BE)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
