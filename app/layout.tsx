import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";

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
      <body>
        <ErrorBoundary>
          {children}
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}

