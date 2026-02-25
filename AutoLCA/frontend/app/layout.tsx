import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoLCA - Life Cycle Assessment",
  description: "Unified LCA Web Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-hidden">{children}</body>
    </html>
  );
}
