'use client';

import { useRef, useCallback, useState, useReducer, useEffect } from 'react';
import { useTypingGameStore, useGameStatus } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { TypingWord, KanaDisplay, PerWordScoreLog } from '@/types';
import KeyboardSoundUtils from '@/utils/KeyboardSoundUtils';

// タイピング状態を定義
type TypingState = {
  wordStats: {
    keyCount: number;
    correct: number;
    miss: number;
    startTime: number;
  };
  kanaIndex: number;
};

// アクションタイプを定義
type TypingAction = 
  | { type: 'RESET_WORD' }
  | { type: 'INCREMENT_CORRECT' }
  | { type: 'INCREMENT_MISS' }
  | { type: 'SET_START_TIME', time: number }
  | { type: 'ADVANCE_KANA', index?: number };

// レデューサー関数
function typingReducer(state: TypingState, action: TypingAction): TypingState {
  switch (action.type) {
    case 'RESET_WORD':
      return {
        wordStats: { keyCount: 0, correct: 0, miss: 0, startTime: 0 },
        kanaIndex: 0
      };
    case 'INCREMENT_CORRECT':
      return {
        ...state,
        wordStats: {
          ...state.wordStats,
          keyCount: state.wordStats.keyCount + 1,
          correct: state.wordStats.correct + 1
        }
      };
    case 'INCREMENT_MISS':
      return {
        ...state,
        wordStats: {
          ...state.wordStats,
          keyCount: state.wordStats.keyCount + 1,
          miss: state.wordStats.miss + 1
        }
      };
    case 'SET_START_TIME':
      return {
        ...state,
        wordStats: { ...state.wordStats, startTime: action.time }
      };
    case 'ADVANCE_KANA':
      return {
        ...state,
        kanaIndex: action.index !== undefined ? action.index : state.kanaIndex + 1
      };
    default:
      return state;
  }
}

/**
 * 統合タイピング処理フック
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
  
  // 統合されたタイピング状態の管理
  const [typingState, dispatch] = useReducer(typingReducer, {
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
      dispatch({ type: 'RESET_WORD' });
      
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

  // キー入力イベントのハンドラー
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const keyDownHandler = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;
      
      // タイピング入力処理
      if (e.key.length !== 1) return;
      
      const typingChars = typingCharsRef.current;
      const idx = typingState.kanaIndex;
      const currentTypingChar = typingChars[idx];
      
      if (!currentTypingChar) return;

      // 初回入力時の開始時間記録
      if (typingState.wordStats.keyCount === 0) {
        dispatch({ type: 'SET_START_TIME', time: Date.now() });
      }

      // 入力判定
      if (currentTypingChar.canAccept(e.key)) {
        currentTypingChar.accept(e.key);
        dispatch({ type: 'INCREMENT_CORRECT' });
        
        // 打撃音を再生（KeyboardSoundUtils使用）
        KeyboardSoundUtils.playClickSound();
        
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
          dispatch({ type: 'ADVANCE_KANA', index: nextIdx });
          
          if (nextIdx < typingChars.length) {
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
              (typingState.wordStats.correct / typingState.wordStats.keyCount) * 100 : 0;            // スコアログに記録
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
        }
      } else {
        // ミス処理
        dispatch({ type: 'INCREMENT_MISS' });
        // オーディオストアから効果音を再生
        playSound('wrong', 0.5);
      }
    };

    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [gameStatus, advanceToNextWord, setKanaDisplay, setScoreLog, typingState, playSound]);

  // お題切り替え時に進行状態をリセット
  const resetProgress = useCallback(() => {
    userInputRef.current = '';
    dispatch({ type: 'RESET_WORD' });
    
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
  }, [currentWord, setKanaDisplay]);

  return {
    currentKanaIndex: typingState.kanaIndex,
    wordStats: {
      keyCount: typingState.wordStats.keyCount,
      correct: typingState.wordStats.correct,
      miss: typingState.wordStats.miss
    },
    resetProgress,
    userInputRef
  };
}
