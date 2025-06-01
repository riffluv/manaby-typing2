'use client';

import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { useTypingGameStore, useGameStatus } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { TypingWord, KanaDisplay, PerWordScoreLog } from '@/types';
import { simpleKeyInput } from '@/utils/SimpleKeyHandler';
import { OptimizedTypingChar, TypingChar } from '../utils/OptimizedTypingChar';
import { createOptimizedTypingChars } from '../utils/optimizedJapaneseUtils';
import OptimizedAudioSystem from '@/utils/OptimizedAudioSystem';

// typingmania-ref風：最小限のワードスコア
interface WordScore {
  keyCount: number;
  mistakeCount: number;
  startTime: number;
  endTime: number;
}

/**
 * typingmania-ref流 超シンプルタイピング処理フック（パフォーマンス測定統合版）
 * 
 * 複雑な最適化を削除し、typingmania-refのシンプルで効率的な
 * アプローチを採用して最高のレスポンスを実現
 * + リアルタイムパフォーマンス測定機能統合
 */
export function useOptimizedTypingProcessor(
  currentWord: TypingWord,
  setKanaDisplay: (kanaDisplay: KanaDisplay) => void,
  setScoreLog: React.Dispatch<React.SetStateAction<PerWordScoreLog[]>>,
) {
  const gameStatus = useGameStatus();
  const { advanceToNextWord, currentWordIndex } = useTypingGameStore();
  
  // typingmania-ref流：シンプルなRef管理
  const typingCharsRef = useRef<TypingChar[]>([]);
  const currentKanaIndexRef = useRef(0);
  const wordStatsRef = useRef<WordScore>({
    keyCount: 0,
    mistakeCount: 0,
    startTime: 0,
    endTime: 0,
  });
  
  // 音声システム
  const audioEnabled = useAudioStore(state => state.effectsEnabled);
  // typingmania-ref流：高速表示更新（Reactセット + DOM直接更新を併用）
  const updateDisplay = useCallback(() => {
    const typingChars = typingCharsRef.current;
    const currentKanaIndex = currentKanaIndexRef.current;
    
    if (currentKanaIndex >= typingChars.length) return;
    
    const currentChar = typingChars[currentKanaIndex];
    if (!currentChar) return;

    const displayInfo = currentChar.getDisplayInfo();
    
    // React状態更新（表示用）
    setKanaDisplay({
      acceptedText: displayInfo.acceptedText,
      remainingText: displayInfo.remainingText,
      displayText: displayInfo.displayText
    });

    // 🚀 追加: DOM直接更新（typingmania-ref流）
    // OptimizedTypingAreaの直接DOM操作をトリガー
    // プロップス変更により自動的にuseEffectが実行される
  }, [setKanaDisplay]);
  // typingCharsをuseMemoで最適化
  const typingChars = useMemo(() => {
    return currentWord.hiragana ? createOptimizedTypingChars(currentWord.hiragana) : [];
  }, [currentWord.hiragana]);

  // 単語が変わったときの初期化
  useEffect(() => {
    if (!currentWord.hiragana) return;

    // typingmania-ref流：シンプルな初期化
    typingCharsRef.current = typingChars;
    currentKanaIndexRef.current = 0;
    wordStatsRef.current = {
      keyCount: 0,
      mistakeCount: 0,
      startTime: 0,
      endTime: 0,
    };

    updateDisplay();
  }, [typingChars, updateDisplay]);
  // typingmania-ref風：シンプルなキー処理（最高速最適化）
  const handleKeyInput = useCallback((e: KeyboardEvent) => {
    // typingmania-ref流：統合ガード条件で最大効率化
    if (gameStatus !== 'playing' || e.key.length !== 1 || 
        currentKanaIndexRef.current >= typingCharsRef.current.length) return;

    const typingChars = typingCharsRef.current;
    const currentKanaIndex = currentKanaIndexRef.current;
    const wordStats = wordStatsRef.current;
    const currentChar = typingChars[currentKanaIndex];
    
    // 最終ガード（nullチェックのみ）
    if (!currentChar) return;

    // 初回入力時の開始時間記録（最小限の処理）
    if (wordStats.keyCount === 0) {
      wordStats.startTime = performance.now();
    }

    wordStats.keyCount++;

    // typingmania-ref流：シンプルな入力判定
    const result = currentChar.accept(e.key);
      if (result >= 0) {      // 正解：音声再生（最高速対応）
      if (audioEnabled) {
        OptimizedAudioSystem.playClickSound();
      }

      // 文字完了チェック
      if (currentChar.isCompleted()) {
        currentKanaIndexRef.current++;
        
        // 単語完了チェック
        if (currentKanaIndexRef.current >= typingChars.length) {
          wordStats.endTime = performance.now();
          
          // スコア記録（typingmania-ref流）
          const duration = (wordStats.endTime - wordStats.startTime) / 1000;
          const kpm = duration > 0 ? (wordStats.keyCount - wordStats.mistakeCount) / duration * 60 : 0;
          const accuracy = wordStats.keyCount > 0 ? (wordStats.keyCount - wordStats.mistakeCount) / wordStats.keyCount : 1;
          
          setScoreLog(prev => [...prev, {
            keyCount: wordStats.keyCount,
            correct: wordStats.keyCount - wordStats.mistakeCount,
            miss: wordStats.mistakeCount,
            startTime: wordStats.startTime,
            endTime: wordStats.endTime,
            duration,
            kpm: kpm < 0 ? 0 : kpm,
            accuracy: accuracy < 0 ? 0 : accuracy > 1 ? 1 : accuracy,
          }]);          // 次の単語へ（typingmania-ref流：即座遷移）
          advanceToNextWord();
          
          return;
        }
      }
    } else {      // ミス：音声再生（高速入力対応）
      wordStats.mistakeCount++;
      if (audioEnabled) {
        OptimizedAudioSystem.playErrorSound();
      }
    }

    // 表示更新（最小限）
    updateDisplay();
  }, [gameStatus, audioEnabled, setScoreLog, advanceToNextWord, updateDisplay]);

  // キー入力リスナーの設定
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    // typingmania-ref流：シンプルなキー監視
    const cleanup = simpleKeyInput.onKey(handleKeyInput);
    return cleanup;
  }, [gameStatus, handleKeyInput]);
  return {
    currentKanaIndex: currentKanaIndexRef.current,
    wordStats: wordStatsRef.current,
    resetProgress: () => {
      // 参照の値をリセット
      currentKanaIndexRef.current = 0;
      wordStatsRef.current = {
        keyCount: 0,
        mistakeCount: 0,
        startTime: 0,
        endTime: 0,
      };
      
      // 各TypingCharの内部状態をリセット
      const typingChars = typingCharsRef.current;
      typingChars.forEach(char => {
        if (char.reset) {
          char.reset();
        }
      });
        // 表示状態をリセット（これが重要！）
      
      // 最後に表示を更新
      updateDisplay();
      
      console.log('🔄 resetProgress: Complete reset performed');
    }
  };
}
