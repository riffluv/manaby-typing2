'use client';

import { useEffect, useRef } from 'react';
import { TypingWord, KanaDisplay } from '@/types/typing';
import KeyboardSoundUtils from '@/utils/KeyboardSoundUtils';
import { useGameStatus, useTypingGameStore } from '@/store/typingGameStore';
import { PerWordScoreLog } from '@/types/score';

/**
 * タイピングキー入力処理とスコア計算のためのカスタムフック
 */
export function useTypingKeyboardHandler(
  currentWord: TypingWord,
  setKanaDisplay: (kanaDisplay: KanaDisplay) => void,
  setScoreLog: React.Dispatch<React.SetStateAction<PerWordScoreLog[]>>,
) {
  const gameStatus = useGameStatus();
  const { advanceToNextWord } = useTypingGameStore();
  
  // タイピング進行状態の参照
  const typingCharsRef = useRef<TypingWord['typingChars']>([]);
  const kanaIndexRef = useRef<number>(0);
  const wordKeyCountRef = useRef(0);
  const wordCorrectRef = useRef(0);
  const wordMissRef = useRef(0);
  const wordStartTimeRef = useRef<number>(0);

  // 現在のお題が変わったときにrefs更新
  useEffect(() => {
    if (currentWord?.typingChars) {
      typingCharsRef.current = currentWord.typingChars;
      kanaIndexRef.current = 0;
      
      if (currentWord.typingChars.length > 0) {
        const info = currentWord.typingChars[0].getDisplayInfo();
        setKanaDisplay({
          acceptedText: info.acceptedText,
          remainingText: info.remainingText,
          displayText: info.displayText
        });
      }

      // お題切り替え時にスコア記録用refもリセット
      wordKeyCountRef.current = 0;
      wordCorrectRef.current = 0;
      wordMissRef.current = 0;
      wordStartTimeRef.current = 0;
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
      const idx = kanaIndexRef.current;
      const currentTypingChar = typingChars[idx];
      
      if (!currentTypingChar) return;
      
      // 最初のキー入力で時間計測開始
      if (wordKeyCountRef.current === 0) {
        wordStartTimeRef.current = Date.now();
      }
      
      wordKeyCountRef.current++;
      
      if (currentTypingChar.canAccept(e.key)) {
        // 正しいキー入力の処理
        currentTypingChar.accept(e.key);
        wordCorrectRef.current++;
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
          kanaIndexRef.current = nextIdx;
          
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
            const durationMs = now - wordStartTimeRef.current;
            const durationSec = durationMs / 1000;
            let wordKpm = 0;
            let wordAccuracy = 0;
            
            if (durationSec > 0) {
              wordKpm = Math.round((wordKeyCountRef.current / durationSec) * 60 * 10) / 10;
            }
            
            const totalInput = wordCorrectRef.current + wordMissRef.current;
            if (totalInput > 0) {
              wordAccuracy = Math.round((wordCorrectRef.current / totalInput) * 1000) / 10;
            }
            
            // スコアログに追加
            setScoreLog(prev => [...prev, {
              keyCount: wordKeyCountRef.current,
              correct: wordCorrectRef.current,
              miss: wordMissRef.current,
              startTime: wordStartTimeRef.current,
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
        wordMissRef.current++;
        KeyboardSoundUtils.playErrorSound();
      }
    };

    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [gameStatus, advanceToNextWord, setKanaDisplay, setScoreLog]);

  return {
    currentKanaIndex: kanaIndexRef.current,
    wordStats: {
      keyCount: wordKeyCountRef.current,
      correct: wordCorrectRef.current,
      miss: wordMissRef.current
    }
  };
}
