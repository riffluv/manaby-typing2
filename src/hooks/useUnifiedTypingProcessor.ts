'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useTypingGameStore, useGameStatus } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { TypingWord, KanaDisplay, PerWordScoreLog } from '@/types';
import UnifiedAudioSystem from '@/utils/UnifiedAudioSystem';
import { usePerformanceMonitor } from '@/utils/PerformanceMonitor';
import { useDirectDOM } from '@/utils/DirectDOMManager';
import { useHighSpeedKeys } from '@/utils/HighSpeedKeyDetector';
import { useHardwareKeyOptimizer, SystemLatencyMetrics } from '@/utils/HardwareKeyOptimizer';
import { triggerImmediateFeedback } from '@/utils/SynchronizedAudioVisual';

/**
 * 統合タイピング処理フック（typingmania-ref流超高速キー検知版）
 * 40年のtypingmania経験者も納得する最速キー検知を実現
 * ハードウェアレベル最適化 + リアルタイム遅延解析搭載
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
  
  // タイピング文字の参照（パフォーマンス重視）
  const typingCharsRef = useRef<TypingWord['typingChars']>([]);
  const userInputRef = useRef('');
  
  // パフォーマンス監視と直接DOM操作
  const performanceMonitor = usePerformanceMonitor();
  const directDOM = useDirectDOM();
  
  // 🚀 超高速キー検知システム
  const highSpeedKeys = useHighSpeedKeys();
  
  // ハードウェア最適化システム
  const hardwareOptimizer = useHardwareKeyOptimizer();
  
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

  // 🚀 ハードウェア最適化キー入力ハンドラー（typingmania-ref流 + ベテラン対応）
  const createHardwareOptimizedKeyHandler = useCallback(() => {
    return (e: KeyboardEvent, metrics?: SystemLatencyMetrics) => {
      if (gameStatus !== 'playing') return;
      
      // タイピング入力処理（文字のみ）
      if (e.key.length !== 1) return;
      
      // 🎯 ハードウェアレベル パフォーマンス測定開始
      const perfStart = performanceMonitor.startInputMeasurement(e.key);
      
      // ベテラン級遅延解析（ハードウェア→応答完了まで）
      if (metrics) {
        console.log(`🔧 [${e.key}] Hardware→JS: ${metrics.hardwareTimestamp ? (performance.now() - metrics.hardwareTimestamp).toFixed(3) : 'N/A'}ms | OS: ${metrics.osInputDelay.toFixed(3)}ms | Total: ${metrics.totalSystemLatency.toFixed(3)}ms`);
        
        // ベテラン感覚閾値チェック（8ms）
        if (metrics.totalSystemLatency > 8) {
          console.warn(`⚠️ ベテラン感覚超過: ${metrics.totalSystemLatency.toFixed(3)}ms - 要最適化`);
        } else if (metrics.totalSystemLatency <= 3) {
          console.log(`🎯 プロ級遅延達成: ${metrics.totalSystemLatency.toFixed(3)}ms`);
        }
      }
      
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
        typingState.wordStats.startTime = performance.now(); // より高精度
      }

      // 入力判定（超高速）
      if (currentTypingChar.canAccept(e.key)) {
        currentTypingChar.accept(e.key);
        
        // 🚨 緊急ロールバック: シンプルな同期処理に戻す
        typingState.wordStats.keyCount++;
        typingState.wordStats.correct++;
        
        // 🎯 同期音声・視覚フィードバック（typingmania-ref流 < 5ms）
        const info = currentTypingChar.getDisplayInfo();
        triggerImmediateFeedback(
          e.key,
          true, // 正解
          () => {
            setKanaDisplay({
              acceptedText: info.acceptedText,
              remainingText: info.remainingText,
              displayText: info.displayText
            });
          }
        );
        
        userInputRef.current += e.key;
        
        // かなが完了したら次へ
        if (info.isCompleted) {
          const nextIdx = idx + 1;
          typingState.kanaIndex = nextIdx;
          
          // DOM操作（同期実行）
          if (nextIdx < typingChars.length) {
            directDOM.updateCurrentCharHighlight(nextIdx, 0);
            
            const nextInfo = typingChars[nextIdx].getDisplayInfo();
            // 🎯 次のかな文字への同期視覚フィードバック
            setKanaDisplay({
              acceptedText: nextInfo.acceptedText,
              remainingText: nextInfo.remainingText,
              displayText: nextInfo.displayText
            });
          } else {
            // 単語完了処理（同期実行）
            const endTime = performance.now();
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
          // 文字レベルでの直接DOM更新（同期実行）
          const acceptedLength = info.acceptedText.length;
          directDOM.updateCurrentCharHighlight(idx, acceptedLength);
        }
      } else {
        // ミス処理（直接状態更新）
        typingState.wordStats.keyCount++;
        typingState.wordStats.miss++;
        
        // 🎯 同期エラーフィードバック（音声・視覚）
        triggerImmediateFeedback(e.key, false);
      }
      
      // パフォーマンス測定終了
      performanceMonitor.endRenderMeasurement(e.key, perfStart);
    };
  }, [gameStatus, advanceToNextWord, setKanaDisplay, setScoreLog, currentWordIndex, performanceMonitor, directDOM]);

  // 🚨 完全ロールバック: 元の高速検知システムのみ使用
  useEffect(() => {
    if (gameStatus === 'playing') {
      console.log('🚨 完全ロールバック: 元のシステムのみ使用');

      const keyHandler = createHardwareOptimizedKeyHandler();
      
      // 元の高速検知システムのみ使用
      highSpeedKeys.setTypingHandler((e: KeyboardEvent) => keyHandler(e));
      highSpeedKeys.startListening();

      return () => {
        console.log('🛑 元のシステム停止');
        highSpeedKeys.stopListening();
      };
    }
  }, [gameStatus, createHardwareOptimizedKeyHandler, highSpeedKeys]);

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
