import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "@/styles/design-tokens.css";
import "@/styles/globals-reset.css";
import "./globals.css";
import AppLayout from '@/components/AppLayout';
import AudioSystemInitializer from '@/components/AudioSystemInitializer';
import BGMInitializer from '@/components/BGMInitializer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "manabytype II - FF16風タイピングゲーム",
  description: "Final Fantasy XVI風デザインのタイピングゲーム",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased`}
        suppressHydrationWarning
      >
        <AudioSystemInitializer />
        <BGMInitializer />
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
