/**
 * 🎯 useSimpleTyping - BasicTypingChar対応版
 * 
 * BasicTypingChar配列を処理し、複数入力パターン（ji/zi）をサポート
 * BasicTypingEngineを使用してhigh-performanceタイピング処理を実現
 */

import { useRef, useEffect, useState } from 'react';
import { TypingWord, PerWordScoreLog, KanaDisplay } from '@/types';
import { BasicTypingChar } from '@/utils/BasicTypingChar';
import { BasicTypingEngine } from '@/utils/BasicTypingEngine';

export interface UseSimpleTypingProps {
  word: TypingWord;
  typingChars: BasicTypingChar[];
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
}

export interface UseSimpleTypingReturn {
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
 * シンプルなタイピングフック - BasicTypingChar対応版
 * BasicTypingEngineを使用して高速タイピング処理を実現
 */
export function useSimpleTyping({
  word,
  typingChars,
  onWordComplete,
}: UseSimpleTypingProps): UseSimpleTypingReturn {  
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<BasicTypingEngine | null>(null);
  const currentWordRef = useRef<string | undefined>(undefined); // 現在の単語を追跡（undefinedで初期化）
  const isInitializedRef = useRef<boolean>(false); // 初期化状態を追跡// 進行状況の状態
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [kanaDisplay, setKanaDisplay] = useState<KanaDisplay | null>(null);
  const [detailedProgress, setDetailedProgress] = useState<{
    currentKanaIndex: number;
    currentRomajiIndex: number;
    totalKanaCount: number;
    totalRomajiCount: number;
    currentKanaDisplay: KanaDisplay | null;
  } | null>(null);  // エンジンの初期化 - 単語変更時のみ実行し、トランジション再レンダリングを無視
  useEffect(() => {
    if (!containerRef.current || typingChars.length === 0) return;

    // 厳密な同一単語チェック - 初期化済みかつ同じ単語なら何もしない
    const isSameWord = currentWordRef.current === word.hiragana;
    const isAlreadyInitialized = isInitializedRef.current && engineRef.current;
    
    if (isSameWord && isAlreadyInitialized) {      return;
    }

    console.log('🔄 [useSimpleTyping] Initializing engine:', {
      previousWord: currentWordRef.current,
      newWord: word.hiragana,
      wasInitialized: isInitializedRef.current,
      hasEngine: !!engineRef.current
    });    // 既存のエンジンをクリーンアップ（異なる単語または初期化が必要な場合のみ）
    if (engineRef.current) {
      engineRef.current.cleanup();
      engineRef.current = null;
    }

    // UI状態を初期化（エンジン初期化前に実行）
    setCurrentCharIndex(0);
    setKanaDisplay(null);
    setDetailedProgress(null);

    // 新しいエンジンを作成
    engineRef.current = new BasicTypingEngine();
    engineRef.current.initialize(
      containerRef.current,
      typingChars,        (index: number, display: KanaDisplay) => {
        // onProgress - 進行状況を更新
        setCurrentCharIndex(index);
        setKanaDisplay(display);
        
        // 詳細な進捗情報も更新
        if (engineRef.current) {
          setDetailedProgress(engineRef.current.getDetailedProgress());
        }
      },
      (scoreLog: PerWordScoreLog) => {
        // onComplete - BasicTypingEngineからの実際のスコアデータを受け取る
        if (onWordComplete) {
          onWordComplete(scoreLog);
        }
      }    );

    // 現在の単語と初期化状態を更新
    currentWordRef.current = word.hiragana;
    isInitializedRef.current = true;    // エンジン初期化直後の初期状態を取得して設定
    const initialProgress = engineRef.current.getDetailedProgress();
    setDetailedProgress(initialProgress);

    // クリーンアップ関数
    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
        engineRef.current = null;
      }
      // 注意: refはリセットしない（同じ単語かどうかの判定で必要）
    };
  }, [word.hiragana]); // 依存関係を単語のみに限定

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
        engineRef.current = null;
      }
      currentWordRef.current = undefined;
      isInitializedRef.current = false;
    };
  }, []);

// 単語が変わったときに進行状況をリセット（エンジン初期化後）
  useEffect(() => {
    // 同じ単語での不要なリセットを防ぐ
    if (currentWordRef.current === word.hiragana) {
      return;
    }
      setCurrentCharIndex(0);
    setKanaDisplay(null);
    setDetailedProgress(null);
  }, [word.hiragana]);

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
