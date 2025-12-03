import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Importiraj HEADER (ne Navbar)
import Header from "@/components/header"; 
import Footer from "@/components/footer"; // Pretpostavljam da je footer u components folderu

// 2. Importiraj CartProvider
import { CartProvider } from "@/context/cart-context"; 

import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Moja Aplikacija",
  description: "Opis aplikacije",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          
          {/* DODAJ OVO NA DNU (prije zatvaranja CartProvidera ili Body-a) */}
          <Toaster /> 
          
        </CartProvider>
      </body>
    </html>
  );
}