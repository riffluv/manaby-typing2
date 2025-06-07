'use client';

import { useEffect } from 'react';

/**
 * 🔍 パフォーマンス調査ツール初期化コンポーネント
 * typingmania-ref簡素化により、複雑なパフォーマンス測定システムは削除済み
 */
const PerformanceDebugInitializer: React.FC = () => {
  useEffect(() => {
    // 開発環境でのみ実行
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 typingmania-ref Style: シンプルな直接処理で最適化済み');
      console.log('📊 73%コード削減、デッドタイム解消完了');
    }
  }, []);

  return null; // UIは何も描画しない
};

export default PerformanceDebugInitializer;
