import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ビルド時のESLintチェックを無効化（開発中のため）
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
