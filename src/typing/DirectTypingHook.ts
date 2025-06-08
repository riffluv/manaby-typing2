/**
 * DirectTypingHook - typingmania-ref スタイル React統合フック
 * 
 * 🚀 DirectTypingEngineをReactで使用するためのカスタムフック
 * HyperTypingHookとの互換性を保ちながら最高のパフォーマンスを提供
 */

import { useRef, useState, useEffect } from 'react';
import { DirectTypingEngine } from './DirectTypingEngine';
import type { TypingChar } from './TypingChar';
import type { KanaDisplay, PerWordScoreLog, TypingWord } from '@/types';

export interface DirectTypingHookProps {
  word: TypingWord;
  typingChars: TypingChar[];
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
}

export interface DirectTypingHookReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentCharIndex: number;
  kanaDisplay: KanaDisplay | null;
  detailedProgress: {
    currentKanaIndex: number;
    currentRomajiIndex: number;
    totalKanaCount: number;
    totalRomajiCount: number;
    currentKanaDisplay: {
      acceptedText: string;
      remainingText: string;
      displayText: string;
    };
  } | null;
  getDetailedProgress: () => any;
}

/**
 * 🚀 DirectTypingEngine React統合フック
 * 
 * typingmania-ref スタイルの特徴:
 * - 直接DOM操作による最高レスポンス性能
 * - デッドタイム解消
 * - 軽量DOM更新
 * - 高速連続入力対応
 */
export function useDirectTyping({
  word,
  typingChars,
  onWordComplete,
}: DirectTypingHookProps): DirectTypingHookReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<DirectTypingEngine | null>(null);
  const currentWordRef = useRef<string | undefined>(undefined);

  // 進行状況の状態
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [kanaDisplay, setKanaDisplay] = useState<KanaDisplay | null>(null);
  const [detailedProgress, setDetailedProgress] = useState<{
    currentKanaIndex: number;
    currentRomajiIndex: number;
    totalKanaCount: number;
    totalRomajiCount: number;
    currentKanaDisplay: {
      acceptedText: string;
      remainingText: string;
      displayText: string;
    };
  } | null>(null);

  /**
   * 🚀 DirectTypingEngine 初期化
   * HyperTypingEngineと同じ I/F を維持
   */
  const initializeEngine = () => {
    if (!containerRef.current || !typingChars.length) {
      return;
    }

    // 前のエンジンがあればクリーンアップ
    if (engineRef.current) {
      engineRef.current.cleanup();
    }    // 🚀 新しいDirectTypingEngineを作成（既存デザインスタイルで）
    const customConfig = {
      fontFamily: '"ヒラギノ角ゴ Pro", "Hiragino Kaku Gothic Pro", "メイリオ", Meiryo, "MS PGothic", sans-serif',
      fontSize: '1.4rem',
      fontWeight: 'bold',
      activeColor: '#fff5aa',      // 現在入力中の文字（ゴールド系）
      inactiveColor: '#8a8a8a',    // まだ入力していない文字（落ち着いたグレー）
      progressColor: '#ffd700',    // 入力中の文字（ゴールド）
      completedColor: '#87ceeb',   // 完了した文字（スカイブルー）
      backgroundColor: 'transparent'
    };
    
    engineRef.current = new DirectTypingEngine(customConfig);
    
    // エンジン初期化（HyperTypingEngineと同じインターフェース）
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
   * 詳細進捗更新
   */
  const updateDetailedProgress = () => {
    if (!engineRef.current) return;

    const progress = engineRef.current.getDetailedProgress();
    setDetailedProgress(progress);
  };

  /**
   * 詳細進捗取得
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

export default useDirectTyping;
