import { useEffect } from 'react';
import { useAudioStore } from '@/store/audioStore';
import { useTypingGameStore } from '@/store/typingGameStore';

/**
 * Typingゲームの初期化・サウンドプリロード副作用をまとめるカスタムフック
 */
export function useTypingGameLifecycle() {
  const { preloadSounds } = useAudioStore();
  const { setupCurrentWord } = useTypingGameStore();

  useEffect(() => {
    preloadSounds();
    setupCurrentWord();
  }, [preloadSounds, setupCurrentWord]);
}
