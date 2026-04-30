import type { Metadata } from "next";
import "./globals.css";
import { NightSky } from "./components/NightSky";
import { ShootingStarProvider } from "./components/ShootingStar";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@500;700;800&family=Fredoka:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NightSky />
        <ShootingStarProvider>{children}</ShootingStarProvider>
      </body>
    </html>
  );
}
