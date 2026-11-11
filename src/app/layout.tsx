import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/queryProviders";

export const metadata: Metadata = {
  title: "Pinkara Studio",
  description: "Toko Bunga Besty",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
