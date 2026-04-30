import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Story Builder",
  description: "Build your own silly, brave, or happy story!",
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
