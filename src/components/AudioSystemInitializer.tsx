// AudioSystemInitializer.tsx - 音響システム初期化コンポーネント
'use client';

import { useEffect } from 'react';
import UltraFastAudioSystem from '@/utils/UltraFastAudioSystem';

const AudioSystemInitializer = () => {
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        UltraFastAudioSystem.init();
      } catch (error) {
        console.error('[AudioSystemInitializer] 音響システムの初期化に失敗:', error);
      }
    };

    initializeAudio();
  }, []);

  // この初期化コンポーネントは何も描画しない
  return null;
};

export default AudioSystemInitializer;
