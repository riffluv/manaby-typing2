import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "@/styles/design-tokens.css";
import "@/styles/globals-reset.css";
import "./globals.css";
import AppLayout from '@/components/AppLayout';
import AudioSystemInitializer from '@/components/AudioSystemInitializer';
import BGMInitializer from '@/components/BGMInitializer';
import { UltraOptimizedJapaneseProcessor } from '@/typing/UltraOptimizedJapaneseProcessor';

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
  title: "manabytype II",
  description: "manaby",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// 🚀 最新最適化技術による超高速キャッシュの事前生成
if (typeof window !== 'undefined') {
  // アプリ起動時にUltraOptimizedキャッシュを事前生成
  UltraOptimizedJapaneseProcessor.clearCache();
  
  // よく使用される日本語文字列でキャッシュを事前生成
  const commonWords = [
    'こんにちは', 'プログラミング', 'コンピューター', 'インターネット',
    'タイピング', 'キーボード', 'マナビー', 'おはよう', 'ありがとう'
  ];
  
  commonWords.forEach(word => {
    UltraOptimizedJapaneseProcessor.createUltraOptimizedTypingChars(word);
  });
}

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
