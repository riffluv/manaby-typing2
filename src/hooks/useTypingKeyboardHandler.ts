'use client';

import { useEffect, useRef, useReducer, useCallback } from 'react';
import { TypingWord, KanaDisplay } from '@/types/typing';
import KeyboardSoundUtils from '@/utils/KeyboardSoundUtils';
import { useGameStatus, useTypingGameStore } from '@/store/typingGameStore';
import { PerWordScoreLog } from '@/types/score';

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
        ...state,
        wordStats: {
          keyCount: 0,
          correct: 0,
          miss: 0,
          startTime: 0
        },
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
        wordStats: {
          ...state.wordStats,
          startTime: action.time
        }
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
 * タイピングキー入力処理とスコア計算のためのカスタムフック
 * リファクタリング: useReducerを活用し、関連する状態をグループ化
 */
export function useTypingKeyboardHandler(
  currentWord: TypingWord,
  setKanaDisplay: (kanaDisplay: KanaDisplay) => void,
  setScoreLog: React.Dispatch<React.SetStateAction<PerWordScoreLog[]>>,
) {
  const gameStatus = useGameStatus();
  const { advanceToNextWord } = useTypingGameStore();
  
  // タイピング文字の参照 (パフォーマンス重視のためrefのまま)
  const typingCharsRef = useRef<TypingWord['typingChars']>([]);
  
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

  // 現在のかなのインデックスを取得するための関数
  const getCurrentKanaIndex = useCallback(() => {
    return typingState.kanaIndex;
  }, [typingState.kanaIndex]);
  
  // 現在のお題が変わったときに状態更新
  useEffect(() => {
    if (currentWord?.typingChars) {
      typingCharsRef.current = currentWord.typingChars;
      dispatch({ type: 'RESET_WORD' });
      
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
      
      // 最初のキー入力で時間計測開始
      if (typingState.wordStats.keyCount === 0) {
        dispatch({ type: 'SET_START_TIME', time: Date.now() });
      }
      
      if (currentTypingChar.canAccept(e.key)) {
        // 正しいキー入力の処理
        currentTypingChar.accept(e.key);
        dispatch({ type: 'INCREMENT_CORRECT' });
        KeyboardSoundUtils.playClickSound();
        
        const info = currentTypingChar.getDisplayInfo();
        setKanaDisplay({
          acceptedText: info.acceptedText,
          remainingText: info.remainingText,
          displayText: info.displayText
        });
        
        // かなが完了したら次へ
        if (info.isCompleted) {
          const nextIdx = idx + 1;
          dispatch({ type: 'ADVANCE_KANA', index: nextIdx });
          
          if (nextIdx < typingChars.length) {
            // 次の文字へ
            const nextInfo = typingChars[nextIdx].getDisplayInfo();
            setKanaDisplay({
              acceptedText: nextInfo.acceptedText,
              remainingText: nextInfo.remainingText,
              displayText: nextInfo.displayText
            });
          } else {
            // お題完了時のスコア計算
            const now = Date.now();
            const durationMs = now - typingState.wordStats.startTime;
            const durationSec = durationMs / 1000;
            let wordKpm = 0;
            let wordAccuracy = 0;
            
            if (durationSec > 0) {
              wordKpm = Math.round((typingState.wordStats.keyCount / durationSec) * 60 * 10) / 10;
            }
            
            const totalInput = typingState.wordStats.correct + typingState.wordStats.miss;
            if (totalInput > 0) {
              wordAccuracy = Math.round((typingState.wordStats.correct / totalInput) * 1000) / 10;
            }
            
            // スコアログに追加
            setScoreLog(prev => [...prev, {
              keyCount: typingState.wordStats.keyCount,
              correct: typingState.wordStats.correct,
              miss: typingState.wordStats.miss,
              startTime: typingState.wordStats.startTime,
              endTime: now,
              duration: durationSec,
              kpm: wordKpm,
              accuracy: wordAccuracy
            }]);
            
            // 次のお題へ進む
            setTimeout(() => {
              advanceToNextWord();
            }, 300);
          }
        }
      } else {
        // 誤ったキー入力の処理
        dispatch({ type: 'INCREMENT_MISS' });
        KeyboardSoundUtils.playErrorSound();
      }
    };

    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [gameStatus, advanceToNextWord, setKanaDisplay, setScoreLog, typingState]);

  return {
    currentKanaIndex: typingState.kanaIndex,
    wordStats: {
      keyCount: typingState.wordStats.keyCount,
      correct: typingState.wordStats.correct,
      miss: typingState.wordStats.miss
    }
  };
}
