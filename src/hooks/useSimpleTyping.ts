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
  const engineRef = useRef<BasicTypingEngine | null>(null);  // 進行状況の状態
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [kanaDisplay, setKanaDisplay] = useState<KanaDisplay | null>(null);
  const [detailedProgress, setDetailedProgress] = useState<{
    currentKanaIndex: number;
    currentRomajiIndex: number;
    totalKanaCount: number;
    totalRomajiCount: number;
    currentKanaDisplay: KanaDisplay | null;
  } | null>(null);
  // エンジンの初期化
  useEffect(() => {
    if (!containerRef.current || typingChars.length === 0) return;

    // 既存のエンジンをクリーンアップ
    if (engineRef.current) {
      engineRef.current.cleanup();
      engineRef.current = null;
    }    

    // 新しいエンジンを作成
    engineRef.current = new BasicTypingEngine();    
    engineRef.current.initialize(
      containerRef.current,
      typingChars,      
      (index: number, display: KanaDisplay) => {
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
      }
    );

    // クリーンアップ関数
    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
        engineRef.current = null;
      }
    };
  }, [word.hiragana, typingChars, onWordComplete]);// 単語が変わったときに進行状況をリセット
  useEffect(() => {
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
