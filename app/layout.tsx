import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sourceCode = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code",
});

export const metadata: Metadata = {
  title: "タイピングマスター",
  description: "Next.js 14で構築された高速タイピングゲーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} ${sourceCode.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
