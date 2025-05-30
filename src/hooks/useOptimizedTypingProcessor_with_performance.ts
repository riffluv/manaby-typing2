'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { useTypingGameStore, useGameStatus } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { TypingWord, KanaDisplay, PerWordScoreLog } from '@/types';
import UnifiedAudioSystem from '@/utils/UnifiedAudioSystem';
import { simpleKeyInput } from '@/utils/SimpleKeyHandler';
import { createOptimizedTypingChars } from '../utils/optimizedJapaneseUtils';
import performanceMeasurer from '../utils/PerformanceMeasurer';

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
  const typingCharsRef = useRef<any[]>([]);
  const currentKanaIndexRef = useRef(0);
  const wordStatsRef = useRef<WordScore>({
    keyCount: 0,
    mistakeCount: 0,
    startTime: 0,
    endTime: 0,
  });
  
  // 音声システム
  const audioEnabled = useAudioStore(state => state.effectsEnabled);

  // typingmania-ref流：文字更新処理
  const updateDisplay = useCallback(() => {
    const typingChars = typingCharsRef.current;
    const currentKanaIndex = currentKanaIndexRef.current;
    
    if (currentKanaIndex >= typingChars.length) return;
    
    const currentChar = typingChars[currentKanaIndex];
    if (!currentChar) return;

    const displayInfo = currentChar.getDisplayInfo();
    
    setKanaDisplay({
      acceptedText: displayInfo.acceptedText,
      remainingText: displayInfo.remainingText,
      displayText: displayInfo.displayText
    });
  }, [setKanaDisplay]);

  // 単語が変わったときの初期化
  useEffect(() => {
    if (!currentWord.hiragana) return;

    // typingmania-ref流：シンプルな初期化
    typingCharsRef.current = createOptimizedTypingChars(currentWord.hiragana);
    currentKanaIndexRef.current = 0;
    wordStatsRef.current = {
      keyCount: 0,
      mistakeCount: 0,
      startTime: 0,
      endTime: 0,
    };

    updateDisplay();
  }, [currentWord, updateDisplay]);

  // typingmania-ref風：シンプルなキー処理（超高速最適化 + パフォーマンス測定）
  const handleKeyInput = useCallback((e: KeyboardEvent) => {
    // パフォーマンス測定：キー押下時刻記録
    const keyDownTime = performance.now();
    performanceMeasurer.recordKeyDown(e.key, keyDownTime);

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
    
    if (result >= 0) {
      // 正解：音声再生（最高速対応）+ パフォーマンス測定
      if (audioEnabled) {
        UnifiedAudioSystem.playClickSound();
        // パフォーマンス測定：音響再生時刻記録
        performanceMeasurer.recordAudioPlay(e.key, performance.now());
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
          }]);

          // 次の単語へ（typingmania-ref流：即座遷移）
          // Reactの制約でsetTimeoutを使用するが、遅延を最小化
          setTimeout(() => {
            advanceToNextWord();
          }, 16); // 1フレーム（16ms）で即座遷移
          
          return;
        }
      }
    } else {
      // ミス：音声再生（高速入力対応）+ パフォーマンス測定
      wordStats.mistakeCount++;
      if (audioEnabled) {
        UnifiedAudioSystem.playErrorSound();
        // パフォーマンス測定：エラー音響再生時刻記録
        performanceMeasurer.recordAudioPlay(e.key + '_error', performance.now());
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
      currentKanaIndexRef.current = 0;
      wordStatsRef.current = {
        keyCount: 0,
        mistakeCount: 0,
        startTime: 0,
        endTime: 0,
      };
      updateDisplay();
    }
  };
}
