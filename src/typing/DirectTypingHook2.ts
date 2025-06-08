import { useRef, useEffect, useCallback } from 'react';
import { DirectTypingEngine2 } from './DirectTypingEngine2';
import { TypingChar } from './TypingChar';
import { TypingWord, PerWordScoreLog } from '@/types';
import { useSettingsStore } from '@/store/useSettingsStore';

export interface DirectTypingHook2Config {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  backgroundColor?: string;
}

export interface UseDirectTyping2Props {
  word: TypingWord;
  typingChars: TypingChar[];
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
  config?: DirectTypingHook2Config;
}

/**
 * DirectTypingEngine2用Reactフック
 * 原文 + ローマ字フォーカス表示
 */
export function useDirectTyping2({
  word,
  typingChars,
  onWordComplete,
  config = {}
}: UseDirectTyping2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<DirectTypingEngine2 | null>(null);
  const { showKanaDisplay } = useSettingsStore();

  // エンジン初期化
  useEffect(() => {
    if (!containerRef.current || typingChars.length === 0) return;

    // 前のエンジンをクリーンアップ
    if (engineRef.current) {
      engineRef.current.destroy();
    }

    // 新しいエンジンを作成
    const engine = new DirectTypingEngine2({
      fontFamily: config.fontFamily || 'inherit',
      fontSize: config.fontSize || '2rem',
      fontWeight: config.fontWeight || 'bold',
      backgroundColor: config.backgroundColor || 'transparent',
      showKanaDisplay: showKanaDisplay,
    });

    // 原文を設定（漢字入りのテキスト）
    const originalText = word.japanese || word.hiragana || '';

    engine.initialize(
      containerRef.current,
      typingChars,
      originalText,
      undefined, // onProgress
      onWordComplete
    );

    engineRef.current = engine;    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [word, typingChars, onWordComplete, config, showKanaDisplay]);

  // リセット関数
  const reset = useCallback(() => {
    engineRef.current?.reset();
  }, []);

  // 詳細進捗取得
  const getDetailedProgress = useCallback(() => {
    return engineRef.current?.getDetailedProgress();
  }, []);

  return {
    containerRef,
    reset,
    getDetailedProgress,
  };
}
