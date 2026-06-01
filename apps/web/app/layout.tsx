import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "MacroStake — Put Your Money Where Your Mouth Is",
    template: "%s | MacroStake",
  },
  description:
    "The fitness app that actually holds you accountable. Stake real money on your macros, earn it back by staying on track, and hit your yearly goals.",
  keywords: ["fitness", "macros", "nutrition", "accountability", "calories", "protein", "diet"],
  openGraph: {
    type:        "website",
    siteName:    "MacroStake",
    title:       "MacroStake — Put Your Money Where Your Mouth Is",
    description: "Stake real money on your macros. Miss your goals, pay the price. Hit your streak, earn it back.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#ef4444",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
