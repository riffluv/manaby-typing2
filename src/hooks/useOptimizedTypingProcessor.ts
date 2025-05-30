'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useTypingGameStore, useGameStatus } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { TypingWord, KanaDisplay, PerWordScoreLog } from '@/types';
import UnifiedAudioSystem from '@/utils/UnifiedAudioSystem';
import { simpleKeyInput } from '@/utils/SimpleKeyHandler';
import { OptimizedTypingChar, TypingChar } from '@/utils/OptimizedTypingChar';
import { createOptimizedTypingChars } from '../utils/optimizedJapaneseUtils';

/**
 * typingmania-ref流 超シンプルタイピング処理フック
 * 
 * 複雑な最適化を削除し、typingmania-refのシンプルで効率的な
 * アプローチを採用して最高のレスポンスを実現
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
  const wordStatsRef = useRef({
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
  // typingmania-ref流：シンプルなキー処理（高速入力最適化）
  const handleKeyInput = useCallback((e: KeyboardEvent) => {
    if (gameStatus !== 'playing') return;
    if (e.key.length !== 1) return; // 1文字のキーのみ処理

    const typingChars = typingCharsRef.current;
    const currentKanaIndex = currentKanaIndexRef.current;
    const wordStats = wordStatsRef.current;

    if (currentKanaIndex >= typingChars.length) return;

    const currentChar = typingChars[currentKanaIndex];
    if (!currentChar) return;

    // 初回入力時の開始時間記録
    if (wordStats.keyCount === 0) {
      wordStats.startTime = performance.now();
    }

    wordStats.keyCount++;

    // typingmania-ref流：シンプルな入力判定
    const result = currentChar.accept(e.key);
    
    if (result >= 0) {
      // 正解：音声再生（高速入力対応）
      if (audioEnabled) {
        // 高速タイピング対応：AudioContext状態チェック後に再生
        UnifiedAudioSystem.playClickSound();
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
          const accuracy = wordStats.keyCount > 0 ? ((wordStats.keyCount - wordStats.mistakeCount) / wordStats.keyCount) : 1;

          setScoreLog(prev => [...prev, {
            keyCount: wordStats.keyCount,
            correct: wordStats.keyCount - wordStats.mistakeCount,
            miss: wordStats.mistakeCount,
            startTime: wordStats.startTime,
            endTime: wordStats.endTime,
            duration,
            kpm: Math.max(0, kpm),
            accuracy: Math.max(0, Math.min(1, accuracy)), // 0-1の範囲に正規化
          }]);          // 次の単語へ（遅延最小化：さらに短縮）
          setTimeout(() => {
            advanceToNextWord();
          }, 25); // 50ms→25msに短縮（ベテランユーザー対応）
          
          return;
        }
      }
    } else {
      // ミス：音声再生（高速入力対応）
      wordStats.mistakeCount++;
      if (audioEnabled) {
        UnifiedAudioSystem.playErrorSound();
      }
    }

    // 表示更新（最小限）
    updateDisplay();
  }, [gameStatus, currentWord, audioEnabled, setScoreLog, advanceToNextWord, updateDisplay]);

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
