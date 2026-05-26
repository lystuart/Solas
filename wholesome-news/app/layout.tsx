import type { Metadata } from "next";
import { Geist, Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Solas - Good News Worldwide",
  description: "Explore positive news stories from around the world on an interactive map.",
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${playfair.variable} ${dmSans.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
