import { useEffect } from 'react';
import { useTypingGameStore } from '@/store/typingGameStore';

/**
 * Typingゲームの初期化副作用をまとめるカスタムフック
 * 純粋WebAudioシステムではサウンドプリロードは不要
 * @returns void
 */
export function useTypingGameLifecycle() {
  const { setupCurrentWord } = useTypingGameStore();

  useEffect(() => {
    // 純粋WebAudioシステムではサウンドプリロードは不要
    setupCurrentWord();
  }, [setupCurrentWord]);
}
