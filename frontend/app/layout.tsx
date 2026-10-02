import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { CartProvider } from "@/context/CartContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ModaSepeti | Online Alışveriş",
  description:
    "ModaSepeti ile giyim ve aksesuar ürünlerini keşfedin. Beden ve renk seçenekleriyle kolay ve güvenli alışveriş deneyimi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${inter.className} antialiased flex flex-col min-h-screen`}
      >
        <CartProvider>
          <Header />

          <main className="flex-grow">
            {children}
          </main>

          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}