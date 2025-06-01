/**
 * 🎯 useSimpleTyping - BasicTypingChar対応版
 * 
 * BasicTypingChar配列を処理し、複数入力パターン（ji/zi）をサポート
 * BasicTypingEngineを使用してhigh-performanceタイピング処理を実現
 */

import { useRef, useEffect } from 'react';
import { TypingWord } from '@/types';
import { BasicTypingChar } from '@/utils/BasicTypingChar';
import { BasicTypingEngine } from '@/utils/BasicTypingEngine';

export interface UseSimpleTypingProps {
  word: TypingWord;
  typingChars: BasicTypingChar[];
  onWordComplete?: () => void;
}

export interface UseSimpleTypingReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * シンプルなタイピングフック - BasicTypingChar対応版
 * BasicTypingEngineを使用して高速タイピング処理を実現
 */
export function useSimpleTyping({
  word,
  typingChars,
  onWordComplete,
}: UseSimpleTypingProps): UseSimpleTypingReturn {  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<BasicTypingEngine | null>(null);

  // エンジンの初期化
  useEffect(() => {
    if (!containerRef.current || typingChars.length === 0) return;

    // 既存のエンジンをクリーンアップ
    if (engineRef.current) {
      engineRef.current.cleanup();
    }    // 新しいエンジンを作成
    engineRef.current = new BasicTypingEngine();
    engineRef.current.initialize(
      containerRef.current,
      typingChars,
      undefined, // onProgress - シンプル版では不要
      () => {
        // onComplete
        if (onWordComplete) {
          onWordComplete();
        }
      }
    );

    // クリーンアップ関数
    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
        engineRef.current = null;
      }
    };
  }, [word.hiragana, typingChars, onWordComplete]);

  return {
    containerRef,
  };
}
