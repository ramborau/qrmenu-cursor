import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Menu Manager Pro",
  description: "Restaurant Menu Manager with QR Code Creator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

