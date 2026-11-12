import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/queryProviders";
import ToastProvider from "@/providers/toastProvider";

export const metadata: Metadata = {
  title: "Pinkara Studio",
  description: "Fresh flower bouquets, gift hampers, and custom floral arrangements from Pinkara Studio, Jakarta.",
  // semua gambar ikon ada di public/: favicon.ico (16/32/48), icon.png (512), apple-icon.png (180)
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  );
}
