import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import { AuthProvider } from "./providers/AuthProvider";
import { CartProvider } from "./providers/CartProvider";
import { ToastProvider } from "./providers/ToastProvider";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ricemania.lk"),
  title: {
    default: "Ricemania — Ceylon Kitchen, Colombo",
    template: "%s · Ricemania",
  },
  description:
    "Slow-cooked Ceylon rice, clay-pot curries and street-side kottu. Order online for pickup or delivery across Colombo.",
  keywords: [
    "Sri Lankan food",
    "rice and curry Colombo",
    "kottu delivery",
    "biryani",
    "Ricemania",
  ],
  openGraph: {
    title: "Ricemania — Ceylon Kitchen",
    description:
      "Slow-cooked Ceylon rice, clay-pot curries and street-side kottu, cooked to order.",
    type: "website",
    locale: "en_LK",
  },
};

export const viewport: Viewport = {
  themeColor: "#f96a15",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream">
        <AuthProvider>
          <CartProvider>
            <ToastProvider>{children}</ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
