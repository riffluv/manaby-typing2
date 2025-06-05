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
    if (!containerRef.current || !typingChars.length) {
      return;
    }

    // 前のエンジンがあればクリーンアップ
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
        setCurrentCharIndex(index);
        setKanaDisplay(display);
        updateDetailedProgress();
      },
      (scoreLog: PerWordScoreLog) => {
        onWordComplete?.(scoreLog);
      }
    );

    updateDetailedProgress();
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

  // React Strict Mode対応の初期化Effect
  useEffect(() => {
    const newWordKey = word.hiragana || word.japanese || '';
    
    // 初期化条件チェック
    if (!containerRef.current || !typingChars.length) {
      return;
    }
    
    // 既に同じ単語で初期化済みかつエンジンが生きている場合はスキップ
    if (currentWordRef.current === newWordKey && engineRef.current) {
      return;
    }
    
    currentWordRef.current = newWordKey;
    initializeEngine();
    
    // Strict Mode対応：クリーンアップ関数を返す
    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
        engineRef.current = null;
      }
    };
  }, [word.hiragana, word.japanese, typingChars]);

  return {
    containerRef,
    currentCharIndex,
    kanaDisplay,
    detailedProgress,
    getDetailedProgress,
  };
}
