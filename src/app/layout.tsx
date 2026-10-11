import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { StoreProvider } from "@/components/store-provider";
import { SITE } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Kurovia — Premium American Goods, Delivered Worldwide",
    template: "%s | Kurovia",
  },
  description:
    "Shop authentic US brands in tech, fashion, home, beauty, sports and pantry. Shipped from our Delaware fulfillment center to 150+ countries with full tracking.",
  keywords: ["buy from USA", "international shipping", "American products", "US store worldwide delivery", "Kurovia", "GetKurovia"],
  applicationName: "Kurovia",
  openGraph: {
    type: "website",
    siteName: "Kurovia",
    url: SITE.url,
    title: "Kurovia — Premium American Goods, Delivered Worldwide",
    description: "Authentic US products shipped from America to your door, anywhere in the world.",
    images: [{ url: "/images/hero.jpg", width: 1600, height: 900, alt: "Kurovia — curated American products" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kurovia — Premium American Goods, Delivered Worldwide",
    description: "Authentic US products shipped from America to your door, anywhere in the world.",
    images: ["/images/hero.jpg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#081133",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased">
        <StoreProvider>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <CartDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}
