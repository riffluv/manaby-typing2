import { useRef, useEffect, useCallback } from 'react';
import { HybridTypingEngine } from './HybridTypingEngine';
import { TypingChar } from './TypingChar';
import { TypingWord, PerWordScoreLog } from '@/types';
import { useSettingsStore } from '@/store/useSettingsStore';

export interface HybridTypingHookConfig {
  showKanaDisplay?: boolean;
}

export interface UseHybridTypingProps {
  word: TypingWord;
  typingChars: TypingChar[];
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
  config?: HybridTypingHookConfig;
}

/**
 * HybridTypingEngine用Reactフック
 * ローマ字のみCanvas、原文・ひらがなはDOM維持
 */
export function useHybridTyping({
  word,
  typingChars,
  onWordComplete,
  config = {}
}: UseHybridTypingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<HybridTypingEngine | null>(null);
  const { showKanaDisplay } = useSettingsStore();

  // エンジン初期化
  useEffect(() => {
    if (!containerRef.current || typingChars.length === 0) return;

    // 前のエンジンをクリーンアップ
    if (engineRef.current) {
      engineRef.current.cleanup();
    }    // 新しいハイブリッドエンジンを作成
    const engine = new HybridTypingEngine();

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
        engineRef.current.cleanup();
        engineRef.current = null;
      }
    };
  }, [word, typingChars, onWordComplete, config.showKanaDisplay, showKanaDisplay]);

  // リセット関数
  const reset = useCallback(() => {
    // HybridTypingEngineにはreset機能を今後追加する可能性
    // Performance: Reduce console.log for typing responsiveness
    // console.log('HybridTypingEngine reset (機能準備中)');
  }, []);

  // 詳細進捗取得
  const getDetailedProgress = useCallback(() => {
    // HybridTypingEngineには詳細進捗取得機能を内部で使用
    // Performance: Reduce console.log for typing responsiveness
    // console.log('HybridTypingEngine progress (内部処理)');
    return null;
  }, []);

  return {
    containerRef,
    reset,
    getDetailedProgress,
  };
}
