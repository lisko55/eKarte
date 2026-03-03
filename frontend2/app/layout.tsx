import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { InstallPWA } from "@/components/install-pwa";
// 1. Importiraj HEADER (ne Navbar)
import Header from "@/components/header";
import Footer from "@/components/footer";

// 2. Importiraj CartProvider
import { CartProvider } from "@/context/cart-context";

import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "eKarte",
  description: "Najbolja place za kupovinu ulaznica!",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hr">
      <body className={inter.className}>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto py-6 px-4">
              {children}
            </main>
            <Footer />
          </div>
          <InstallPWA />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
