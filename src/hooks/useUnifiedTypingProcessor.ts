'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useTypingGameStore, useGameStatus } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { TypingWord, KanaDisplay, PerWordScoreLog } from '@/types';
import UnifiedAudioSystem from '@/utils/UnifiedAudioSystem';
import { usePerformanceMonitor } from '@/utils/PerformanceMonitor';
import { useDirectDOM } from '@/utils/DirectDOMManager';

/**
 * 統合タイピング処理フック（typingmania-ref流超高速化版）
 * @param currentWord 現在の単語
 * @param setKanaDisplay かな表示更新関数
 * @param setScoreLog スコアログ更新関数
 * @returns 統合タイピング状態・操作関数
 */
export function useUnifiedTypingProcessor(
  currentWord: TypingWord,
  setKanaDisplay: (kanaDisplay: KanaDisplay) => void,
  setScoreLog: React.Dispatch<React.SetStateAction<PerWordScoreLog[]>>,
) {
  const gameStatus = useGameStatus();
  const { advanceToNextWord, currentWordIndex } = useTypingGameStore();
  const { playSound } = useAudioStore();
  
  // タイピング文字の参照（パフォーマンス重視）
  const typingCharsRef = useRef<TypingWord['typingChars']>([]);
  const userInputRef = useRef('');
  
  // パフォーマンス監視と直接DOM操作
  const performanceMonitor = usePerformanceMonitor();
  const directDOM = useDirectDOM();
  
  // typingmania-ref流：useRefベースの高速状態管理（再レンダリングなし）
  const typingStateRef = useRef({
    wordStats: {
      keyCount: 0,
      correct: 0,
      miss: 0,
      startTime: 0
    },
    kanaIndex: 0
  });

  // お題が変わったときの初期化
  useEffect(() => {
    if (currentWord && currentWord.typingChars) {
      typingCharsRef.current = currentWord.typingChars;
      userInputRef.current = '';
      
      // 状態をリセット（useRef直接変更）
      typingStateRef.current = {
        wordStats: { keyCount: 0, correct: 0, miss: 0, startTime: 0 },
        kanaIndex: 0
      };
      
      // 初期表示の設定
      if (currentWord.typingChars.length > 0) {
        const info = currentWord.typingChars[0].getDisplayInfo();
        setKanaDisplay({
          acceptedText: info.acceptedText,
          remainingText: info.remainingText,
          displayText: info.displayText
        });
      }
    }
  }, [currentWord, setKanaDisplay]);

  // キー入力イベントのハンドラー（typingmania-ref流最適化）
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const keyDownHandler = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;
      
      // タイピング入力処理
      if (e.key.length !== 1) return;
      
      // パフォーマンス測定開始
      const perfStart = performanceMonitor.startInputMeasurement(e.key);
      
      const typingChars = typingCharsRef.current;
      const typingState = typingStateRef.current;
      const idx = typingState.kanaIndex;
      const currentTypingChar = typingChars[idx];
      
      if (!currentTypingChar) {
        performanceMonitor.endRenderMeasurement(e.key, perfStart);
        return;
      }

      // 初回入力時の開始時間記録
      if (typingState.wordStats.keyCount === 0) {
        typingState.wordStats.startTime = Date.now();
      }

      // 入力判定（高速化）
      if (currentTypingChar.canAccept(e.key)) {
        currentTypingChar.accept(e.key);
        
        // 直接状態更新（useReducerより高速）
        typingState.wordStats.keyCount++;
        typingState.wordStats.correct++;
        
        // 打撃音を再生（UnifiedAudioSystem使用）
        UnifiedAudioSystem.playClickSound();
        
        const info = currentTypingChar.getDisplayInfo();
        setKanaDisplay({
          acceptedText: info.acceptedText,
          remainingText: info.remainingText,
          displayText: info.displayText
        });
        
        userInputRef.current += e.key;
        
        // かなが完了したら次へ
        if (info.isCompleted) {
          const nextIdx = idx + 1;
          typingState.kanaIndex = nextIdx;
          
          // 直接DOM更新でハイライト移動
          if (nextIdx < typingChars.length) {
            directDOM.updateCurrentCharHighlight(nextIdx, 0);
            
            const nextInfo = typingChars[nextIdx].getDisplayInfo();
            setKanaDisplay({
              acceptedText: nextInfo.acceptedText,
              remainingText: nextInfo.remainingText,
              displayText: nextInfo.displayText
            });
          } else {
            // 単語完了処理
            const endTime = Date.now();
            const timeSec = (endTime - typingState.wordStats.startTime) / 1000;
            const kpm = timeSec > 0 ? (typingState.wordStats.keyCount / timeSec) * 60 : 0;
            
            const accuracy = typingState.wordStats.keyCount > 0 ? 
              (typingState.wordStats.correct / typingState.wordStats.keyCount) * 100 : 0;
              
            // スコアログに記録
            setScoreLog(prev => [...prev, {
              wordIndex: currentWordIndex,
              kpm,
              accuracy,
              correct: typingState.wordStats.correct,
              miss: typingState.wordStats.miss,
              keyCount: typingState.wordStats.keyCount,
              startTime: typingState.wordStats.startTime,
              endTime,
              duration: timeSec
            }]);

            // 次の単語へ進む
            setTimeout(() => {
              advanceToNextWord();
            }, 500);
          }
        } else {
          // 文字レベルでの直接DOM更新
          const acceptedLength = info.acceptedText.length;
          directDOM.updateCurrentCharHighlight(idx, acceptedLength);
        }
      } else {
        // ミス処理（直接状態更新）
        typingState.wordStats.keyCount++;
        typingState.wordStats.miss++;
        
        // オーディオストアから効果音を再生
        playSound('wrong', 0.5);
      }
      
      // パフォーマンス測定終了
      performanceMonitor.endRenderMeasurement(e.key, perfStart);
    };

    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [gameStatus, advanceToNextWord, setKanaDisplay, setScoreLog, currentWordIndex, playSound, performanceMonitor, directDOM]);

  // お題切り替え時に進行状態をリセット
  const resetProgress = useCallback(() => {
    userInputRef.current = '';
    
    // 状態をリセット（useRef直接変更）
    typingStateRef.current = {
      wordStats: { keyCount: 0, correct: 0, miss: 0, startTime: 0 },
      kanaIndex: 0
    };
    
    // 直接DOM操作もリセット
    directDOM.resetTypingArea();
    
    // パフォーマンス監視もリセット
    performanceMonitor.reset();
    
    if (currentWord.typingChars.length > 0) {
      const info = currentWord.typingChars[0].getDisplayInfo();
      setKanaDisplay({
        acceptedText: info.acceptedText,
        remainingText: info.remainingText,
        displayText: info.displayText
      });
    } else {
      setKanaDisplay({ acceptedText: '', remainingText: '', displayText: '' });
    }
  }, [currentWord, setKanaDisplay, directDOM, performanceMonitor]);

  return {
    currentKanaIndex: typingStateRef.current.kanaIndex,
    wordStats: {
      keyCount: typingStateRef.current.wordStats.keyCount,
      correct: typingStateRef.current.wordStats.correct,
      miss: typingStateRef.current.wordStats.miss
    },
    resetProgress,
    userInputRef
  };
}
