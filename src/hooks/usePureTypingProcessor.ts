'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useTypingGameStore, useGameStatus } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { TypingWord, KanaDisplay, PerWordScoreLog } from '@/types';
import PureTypingProcessor from '@/utils/PureTypingProcessor.js';
import { createOptimizedTypingChars } from '@/utils/optimizedJapaneseUtils';
import UnifiedAudioSystem from '@/utils/UnifiedAudioSystem';

/**
 * PureTypingProcessor を使用したReactフック（最軽量版）
 * typingmania-ref風の純粋な処理でReactの重い処理を一切排除
 */
export function usePureTypingProcessor(
  currentWord: TypingWord,
  setKanaDisplay: (kanaDisplay: KanaDisplay) => void,
  setScoreLog: React.Dispatch<React.SetStateAction<PerWordScoreLog[]>>,
) {
  const gameStatus = useGameStatus();
  const { advanceToNextWord } = useTypingGameStore();
  const audioEnabled = useAudioStore(state => state.effectsEnabled);
  
  // PureTypingProcessor インスタンス（クラスベースで軽量）
  const processorRef = useRef<PureTypingProcessor | null>(null);
  const currentWordRef = useRef<TypingWord | null>(null);

  // 初期化処理
  useEffect(() => {
    if (!processorRef.current) {
      processorRef.current = new PureTypingProcessor();
    }
  }, []);

  // 単語変更時の処理
  useEffect(() => {
    if (!currentWord.hiragana || !processorRef.current) return;
    if (currentWordRef.current?.hiragana === currentWord.hiragana) return;

    currentWordRef.current = currentWord;
    
    // typingmania-ref風：単語データ変換
    const typingChars = createOptimizedTypingChars(currentWord.hiragana);
    const kanaArray = typingChars.map(char => ({
      kana: char.kana,
      patterns: char.patterns
    }));

    // PureTypingProcessorに単語セット
    processorRef.current.setWord({
      kanaArray,
      japanese: currentWord.japanese,
      hiragana: currentWord.hiragana
    });

    // 更新コールバックを設定
    processorRef.current.setUpdateCallback((state) => {
      // 表示更新
      setKanaDisplay({
        acceptedText: state.acceptedText,
        remainingText: state.remainingText,
        displayText: state.acceptedText + state.remainingText
      });

      // 単語完了チェック
      if (state.completed) {
        const stats = state.stats;
        const duration = (performance.now() - stats.startTime) / 1000;
        const kpm = duration > 0 ? (stats.keyCount - stats.mistakeCount) / duration * 60 : 0;
        const accuracy = stats.keyCount > 0 ? ((stats.keyCount - stats.mistakeCount) / stats.keyCount) : 1;

        // スコア記録
        setScoreLog(prev => [...prev, {
          keyCount: stats.keyCount,
          correct: stats.keyCount - stats.mistakeCount,
          miss: stats.mistakeCount,
          startTime: stats.startTime,
          endTime: performance.now(),
          duration,
          kpm: Math.max(0, kpm),
          accuracy: Math.max(0, Math.min(1, accuracy)),
        }]);

        // 次の単語へ（少し遅延を入れて自然な感覚に）
        setTimeout(() => {
          advanceToNextWord();
        }, 100);
      }
    });

    // 初期表示更新
    const initialState = processorRef.current.getCurrentState();
    setKanaDisplay({
      acceptedText: initialState.acceptedText,
      remainingText: initialState.remainingText,
      displayText: initialState.acceptedText + initialState.remainingText
    });

  }, [currentWord, setKanaDisplay, setScoreLog, advanceToNextWord]);

  // ゲームステータス変更時のキー監視制御
  useEffect(() => {
    if (!processorRef.current) return;

    if (gameStatus === 'playing') {
      // typingmania-ref風：キー監視開始
      processorRef.current.startListening();
    } else {
      // キー監視停止
      processorRef.current.stopListening();
    }

    return () => {
      if (processorRef.current) {
        processorRef.current.stopListening();
      }
    };
  }, [gameStatus]);

  // 現在の状態を取得
  const getCurrentState = useCallback(() => {
    return processorRef.current?.getCurrentState() || {
      currentKanaIndex: 0,
      acceptedText: '',
      remainingText: '',
      completed: false,
      stats: { keyCount: 0, mistakeCount: 0, startTime: 0 }
    };
  }, []);

  // リセット処理
  const resetProgress = useCallback(() => {
    if (processorRef.current && currentWordRef.current) {
      // 同じ単語で再初期化
      const typingChars = createOptimizedTypingChars(currentWordRef.current.hiragana);
      const kanaArray = typingChars.map(char => ({
        kana: char.kana,
        patterns: char.patterns
      }));

      processorRef.current.setWord({
        kanaArray,
        japanese: currentWordRef.current.japanese,
        hiragana: currentWordRef.current.hiragana
      });

      // 初期表示更新
      const initialState = processorRef.current.getCurrentState();
      setKanaDisplay({
        acceptedText: initialState.acceptedText,
        remainingText: initialState.remainingText,
        displayText: initialState.acceptedText + initialState.remainingText
      });
    }
  }, [setKanaDisplay]);

  const currentState = getCurrentState();

  return {
    currentKanaIndex: currentState.currentKanaIndex,
    wordStats: currentState.stats,
    resetProgress
  };
}
