import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "J Shreyas Aradhya | VLSI & FPGA Engineer",
  description: "Portfolio of J Shreyas Aradhya, an Electronics and Communication Engineering student focused on VLSI design, FPGA development, digital hardware and embedded systems.",
  keywords: ["VLSI", "FPGA", "Hardware", "Embedded Systems", "Electronics", "Engineer", "Portfolio", "J Shreyas Aradhya"],
  authors: [{ name: "J Shreyas Aradhya" }],
  creator: "J Shreyas Aradhya",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "J Shreyas Aradhya | VLSI & FPGA Engineer",
    description: "Portfolio of J Shreyas Aradhya, an Electronics and Communication Engineering student focused on VLSI design, FPGA development, digital hardware and embedded systems.",
    url: baseUrl,
    siteName: "J Shreyas Aradhya Portfolio",
    locale: "en_IN",
    type: "website",
    // images: [] // Add an OG image to public/ later
  },
  twitter: {
    card: "summary", // Using "summary" since we don't have a large image yet
    title: "J Shreyas Aradhya | VLSI & FPGA Engineer",
    description: "Portfolio of J Shreyas Aradhya, an Electronics and Communication Engineering student focused on VLSI design, FPGA development, digital hardware and embedded systems.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
