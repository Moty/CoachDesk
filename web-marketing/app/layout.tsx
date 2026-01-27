import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoachDesk",
  description: "Premium concierge service platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
