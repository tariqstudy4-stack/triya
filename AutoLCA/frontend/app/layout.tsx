import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoLCA - Life Cycle Assessment",
  description: "Unified LCA Web Platform",
};

import ToasterProvider from "@/components/ToasterProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-hidden">
        <ErrorBoundary>
          <ToasterProvider />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
