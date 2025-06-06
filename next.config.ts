import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ビルド時のESLintチェックを無効化（開発中のため）
    ignoreDuringBuilds: true,
  },
  
  // Phase 2: WebAssembly配信最適化 - 根本的改善
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // WebAssemblyファイルの取り扱いを最適化
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/[name].[hash][ext]'
      }
    });

    // WebAssemblyモジュールの読み込み設定
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      topLevelAwait: true,
    };

    // WebAssembly用のAlias設定
    config.resolve.alias = {
      ...config.resolve.alias,
      '@wasm': '/wasm'
    };

    // WASM MIME Type設定
    if (!isServer) {
      config.module.rules.push({
        test: /\.wasm$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '/_next/static/wasm/',
              outputPath: 'static/wasm/',
            },
          },
        ],
      });
    }

    return config;
  },

  // 静的ファイルの最適化ヘッダー - WebAssembly配信強化
  // 静的ファイルの最適化ヘッダー - WebAssembly配信強化
  async headers() {
    return [
      {
        source: '/wasm/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        source: '/wasm/:path*.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
