import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FloatingMobileButton from "@/components/FloatingMobileButton";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CoachDesk - Premium Concierge Service Platform",
  description: "Experience luxury redefined with CoachDesk's white-glove concierge services. From SLA intelligence to secure automation, we deliver excellence at every touchpoint.",
  keywords: ["concierge", "luxury service", "SLA management", "incident command", "knowledge management", "automation"],
  openGraph: {
    title: "CoachDesk - Premium Concierge Service Platform",
    description: "Experience luxury redefined with CoachDesk's white-glove concierge services.",
    type: "website",
    locale: "en_US",
    siteName: "CoachDesk",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoachDesk - Premium Concierge Service Platform",
    description: "Experience luxury redefined with CoachDesk's white-glove concierge services.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-sans">
        <Navbar />
        {children}
        <FloatingMobileButton />
      </body>
    </html>
  );
}
