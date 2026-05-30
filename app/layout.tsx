import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Grain from "@/components/Grain";
import CustomCursor from "@/components/CustomCursor";
import Preloader from "@/components/Preloader";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const text = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-text",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Obsidian Capital — Structured Fund Finance",
  description:
    "Bespoke NAV facilities, GP credit, asymmetric arbitrage funding and secondary LP liquidity for alternative-asset managers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`}>
      <body>
        <Preloader />
        <Grain />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
