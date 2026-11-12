import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Windows: terminal VS Code bisa membuka folder sebagai "c:\..." (huruf drive kecil) -> Vitest memuat modul
// dua kali dan gagal ("failed to find the current suite"). Root dinormalkan ke huruf drive besar
const root = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase());

// unit & component test frontend (panduan: node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md)
export default defineConfig({
  root,
  plugins: [react()],
  // alias "@/..." dari tsconfig.json (didukung langsung oleh Vite, tanpa plugin tambahan)
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // tanggal WIB di test konsisten di semua mesin
    env: { TZ: "Asia/Jakarta" },
  },
});
