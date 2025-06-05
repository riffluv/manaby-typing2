/**
 * TypingHook - typingmania-ref流のReact統合フック
 * 
 * TypingEngineを使用してデモページレベルの応答性を実現
 * React仮想DOMをバイパスし、直接DOM操作で最高速を実現
 */

import { useRef, useEffect, useState } from 'react';
import { TypingWord, PerWordScoreLog, KanaDisplay } from '@/types';
import { TypingChar } from './TypingChar';
import { TypingEngine } from './TypingEngine';

export interface TypingHookProps {
  word: TypingWord;
  typingChars: TypingChar[];
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
}

export interface TypingHookReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentCharIndex: number;
  kanaDisplay: KanaDisplay | null;
  detailedProgress: {
    currentKanaIndex: number;
    currentRomajiIndex: number;
    totalKanaCount: number;
    totalRomajiCount: number;
    currentKanaDisplay: KanaDisplay | null;
  } | null;
  getDetailedProgress: () => any;
}

/**
 * 🚀 超高速タイピングフック - typingmania-ref流最適化版
 * TypingEngineを使用してデモページレベルの応答性を実現
 */
export function useTyping({
  word,
  typingChars,
  onWordComplete,
}: TypingHookProps): TypingHookReturn {  
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TypingEngine | null>(null);
  const currentWordRef = useRef<string | undefined>(undefined);
  const isInitializedRef = useRef<boolean>(false);
  
  // 進行状況の状態
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [kanaDisplay, setKanaDisplay] = useState<KanaDisplay | null>(null);
  const [detailedProgress, setDetailedProgress] = useState<{
    currentKanaIndex: number;
    currentRomajiIndex: number;
    totalKanaCount: number;
    totalRomajiCount: number;
    currentKanaDisplay: KanaDisplay | null;
  } | null>(null);

  /**
   * typingmania-ref流：エンジン初期化
   */
  const initializeEngine = () => {
    if (!containerRef.current || !typingChars.length) return;

    // 既存エンジンのクリーンアップ
    if (engineRef.current) {
      engineRef.current.cleanup();
    }

    // 新しいエンジンを作成
    engineRef.current = new TypingEngine();
    
    // エンジン初期化
    engineRef.current.initialize(
      containerRef.current,
      typingChars,
      (index: number, display: KanaDisplay) => {
        // typingmania-ref流：進捗コールバック
        setCurrentCharIndex(index);
        setKanaDisplay(display);
        updateDetailedProgress();
      },
      (scoreLog: PerWordScoreLog) => {
        // typingmania-ref流：完了コールバック
        onWordComplete?.(scoreLog);
      }
    );

    updateDetailedProgress();
    isInitializedRef.current = true;
  };

  /**
   * typingmania-ref流：詳細進捗更新
   */
  const updateDetailedProgress = () => {
    if (!engineRef.current) return;

    const progress = engineRef.current.getDetailedProgress();
    setDetailedProgress(progress);
  };

  /**
   * typingmania-ref流：詳細進捗取得
   */
  const getDetailedProgress = () => {
    return engineRef.current?.getDetailedProgress() || null;
  };
  // 単語変更時の初期化
  useEffect(() => {
    const newWordKey = word.hiragana || word.japanese || '';
    
    if (currentWordRef.current !== newWordKey || !isInitializedRef.current) {
      currentWordRef.current = newWordKey;
      initializeEngine();
    }
  }, [word, typingChars]);

  // コンテナ準備時の初期化
  useEffect(() => {
    if (containerRef.current && typingChars.length > 0 && !isInitializedRef.current) {
      initializeEngine();
    }
  }, [typingChars]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
    };
  }, []);

  return {
    containerRef,
    currentCharIndex,
    kanaDisplay,
    detailedProgress,
    getDetailedProgress,
  };
}
