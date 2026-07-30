import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DocketIQ — AI-Assisted Judicial Scheduling",
  description:
    "DocketIQ helps courts estimate hearing duration, adjournment risk and case complexity through AI-assisted judicial scheduling.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plexSans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
