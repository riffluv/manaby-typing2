import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
// 2025年最新基準CSS統合
import "@/styles/globals-2025.css";
import AppLayout from '@/components/AppLayout';
import AudioSystemInitializer from '@/components/AudioSystemInitializer';
import BGMInitializer from '@/components/BGMInitializer';
import { JapaneseConverter } from '@/typing/JapaneseConverter';

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

// 🚀 JapaneseConverterによる事前キャッシュ生成
if (typeof window !== 'undefined') {
  // よく使用される日本語文字列でキャッシュを事前生成
  const commonWords = [
    'こんにちは', 'プログラミング', 'コンピューター', 'インターネット',
    'タイピング', 'キーボード', 'マナビー', 'おはよう', 'ありがとう'
  ];
  
  commonWords.forEach(word => {
    JapaneseConverter.convertToTypingChars(word);
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
