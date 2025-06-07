'use client';

import { useEffect } from 'react';

/**
 * 🔍 パフォーマンス調査ツール初期化コンポーネント
 * 開発環境でのみパフォーマンス調査ユーティリティを読み込む
 */
const PerformanceDebugInitializer: React.FC = () => {
  useEffect(() => {
    // 開発環境でのみ実行
    if (process.env.NODE_ENV === 'development') {
      import('@/utils/PerformanceDebugUtils')
        .then(() => {
          console.log('🔍 入力遅延パフォーマンス調査ツールが利用可能です');
        })
        .catch(console.error);
    }
  }, []);

  return null; // UIは何も描画しない
};

export default PerformanceDebugInitializer;
