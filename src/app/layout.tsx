import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Public Restroom & Amenities Finder",
  description:
    "Find clean public restrooms, cold water refill stations, and quiet resting spots near you with real-time community verification and ratings.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased bg-slate-50 flex flex-col">{children}</body>
    </html>
  );
}
