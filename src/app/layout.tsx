import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adswadi – Digital Marketing & Ads Services",
  description: "Unlock greater profits from every ad. Meta ads, Google ads, creative design, and more.",
  icons: {
    icon: [
      { url: "/favicons/favicon.ico", sizes: "any" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favicons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#FAF9FC]">
        {children}
      </body>
    </html>
  );
}
