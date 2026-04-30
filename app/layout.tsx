import type { Metadata } from "next";
import "./globals.css";
import { Sky } from "./components/Sky";
import { ShootingStarProvider } from "./components/ShootingStar";
import { Clock } from "./components/Clock";
import { ThemeProvider, THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  title: "صانع القصص",
  description: "اصنع قصة سحرية لك ولأطفالك في دقيقة واحدة!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <Sky />
          <ShootingStarProvider>{children}</ShootingStarProvider>
          <Clock />
        </ThemeProvider>
      </body>
    </html>
  );
}
