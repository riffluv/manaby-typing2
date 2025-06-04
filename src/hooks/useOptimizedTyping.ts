/**
 * 🚀 useOptimizedTyping - typingmania-ref流の超高速タイピングフック
 * 
 * OptimizedTypingEngineを使用して、デモページレベルの応答性を実現
 * React再レンダリングを最小化し、直接DOM操作で最高速を追求
 */

import { useRef, useEffect, useState } from 'react';
import { TypingWord, PerWordScoreLog, KanaDisplay } from '@/types';
import { BasicTypingChar } from '@/utils/BasicTypingChar';
import { OptimizedTypingEngine } from '@/utils/OptimizedTypingEngine';

export interface UseOptimizedTypingProps {
  word: TypingWord;
  typingChars: BasicTypingChar[];
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
}

export interface UseOptimizedTypingReturn {
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
 * 超高速タイピングフック - OptimizedTypingEngine使用版
 * typingmania-refレベルの応答性を実現
 */
export function useOptimizedTyping({
  word,
  typingChars,
  onWordComplete,
}: UseOptimizedTypingProps): UseOptimizedTypingReturn {  
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<OptimizedTypingEngine | null>(null);
  const currentWordRef = useRef<string | undefined>(undefined);
  const isInitializedRef = useRef<boolean>(false);

  // 進行状況の状態（最小限のReact state）
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [kanaDisplay, setKanaDisplay] = useState<KanaDisplay | null>(null);
  const [detailedProgress, setDetailedProgress] = useState<{
    currentKanaIndex: number;
    currentRomajiIndex: number;
    totalKanaCount: number;
    totalRomajiCount: number;
    currentKanaDisplay: KanaDisplay | null;
  } | null>(null);

  // エンジンの初期化 - 単語変更時のみ実行（高速化）
  useEffect(() => {
    if (!containerRef.current || typingChars.length === 0) return;

    // 厳密な同一単語チェック
    const isSameWord = currentWordRef.current === word.hiragana;
    const isAlreadyInitialized = isInitializedRef.current && engineRef.current;
    
    if (isSameWord && isAlreadyInitialized) {
      return;
    }

    console.log('🚀 [useOptimizedTyping] Initializing ultra-fast engine:', {
      previousWord: currentWordRef.current,
      newWord: word.hiragana,
      wasInitialized: isInitializedRef.current,
      hasEngine: !!engineRef.current
    });

    // 既存のエンジンをクリーンアップ
    if (engineRef.current) {
      engineRef.current.cleanup();
      engineRef.current = null;
    }

    // UI状態を初期化（最小限）
    setCurrentCharIndex(0);
    setKanaDisplay(null);
    setDetailedProgress(null);

    // 新しい超高速エンジンを作成
    engineRef.current = new OptimizedTypingEngine();
    engineRef.current.initialize(
      containerRef.current,
      typingChars,
      (index: number, display: KanaDisplay) => {
        // onProgress - 最小限の状態更新（React再レンダリングを抑制）
        setCurrentCharIndex(index);
        setKanaDisplay(display);
        
        // 詳細な進捗情報も更新（throttling で高速化）
        if (engineRef.current) {
          const progress = engineRef.current.getDetailedProgress();
          setDetailedProgress(progress);
        }
      },
      (scoreLog: PerWordScoreLog) => {
        // onComplete - スコアログ処理
        if (onWordComplete) {
          onWordComplete(scoreLog);
        }
      }
    );

    // 現在の単語と初期化状態を更新
    currentWordRef.current = word.hiragana;
    isInitializedRef.current = true;

    // エンジン初期化直後の初期状態を取得
    const initialProgress = engineRef.current.getDetailedProgress();
    setDetailedProgress(initialProgress);

    // クリーンアップ関数
    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
        engineRef.current = null;
      }
    };
  }, [word.hiragana]); // 依存関係を単語のみに限定

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
        engineRef.current = null;
      }
      currentWordRef.current = undefined;
      isInitializedRef.current = false;
    };
  }, []);

  // 詳細な進捗情報を取得する関数
  const getDetailedProgress = () => {
    return engineRef.current?.getDetailedProgress() || null;
  };

  return {
    containerRef,
    currentCharIndex,
    kanaDisplay,
    detailedProgress,
    getDetailedProgress,
  };
}
