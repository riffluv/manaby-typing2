'use client';

import { useEffect } from 'react';
import { useBGMAutoControl } from '@/hooks/useBGMControl';

/**
 * BGMシステム初期化コンポーネント
 * アプリ全体でBGMを管理し、ページ遷移時の自動切り替えを行う
 * 打撃音WebAudioシステムとは完全分離
 */
const BGMInitializer: React.FC = () => {
  // ページベースの自動BGM制御
  useBGMAutoControl();

  useEffect(() => {
    console.log('[BGMInitializer] 🎵 BGMシステム初期化完了');
    console.log('[BGMInitializer] 🎯 打撃音システムとは完全分離動作');
  }, []);

  // UIは表示しない（バックグラウンド動作）
  return null;
};

export default BGMInitializer;
