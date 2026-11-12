import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/queryProviders";
import ToastProvider from "@/providers/toastProvider";

export const metadata: Metadata = {
  title: "Pinkara Studio",
  description: "Fresh flower bouquets, gift hampers, and custom floral arrangements from Pinkara Florist Studio, Jakarta.",
  icons: {
    icon: "/favicon.ico",
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
