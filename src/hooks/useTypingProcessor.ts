import { useRef, useCallback, useState } from 'react';
import { useTypingGameStore } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';

/**
 * typingmania-ref流: 進行状態はuseRefで管理し、画面表示用だけuseStateで管理
 */
export const useTypingProcessor = () => {
  // 進行状態（インデックス・入力済み文字列など）はuseRefで管理
  const currentKanaIndexRef = useRef(0);
  const userInputRef = useRef('');
  const [kanaDisplay, setKanaDisplay] = useState({
    acceptedText: '',
    remainingText: '',
    displayText: ''
  });

  // お題情報はZustandから取得
  const { currentWord, advanceToNextWord, setupCurrentWord } = useTypingGameStore();
  const { playSound } = useAudioStore();

  // お題切り替え時に進行状態をリセット
  const resetProgress = useCallback(() => {
    currentKanaIndexRef.current = 0;
    userInputRef.current = '';
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
  }, [currentWord]);

  // キーボードイベントハンドラをセットアップ
  const setupKeydownHandler = useCallback((
    status: 'ready' | 'playing' | 'finished',
    onGameStart: () => void,
    onGameReset: () => void,
    onWordComplete: () => void
  ) => {
    let gameStatus = status;
    const keyDownHandler = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') {
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          gameStatus = 'playing';
          onGameStart();
        }
        return;
      }
      if (e.key === 'Escape') {
        onGameReset();
        return;
      }
      if (e.key.length === 1) {
        handleKeyInput(e.key);
      }
    };
    // 進行状態をuseRefで管理
    const handleKeyInput = (key: string) => {
      if (gameStatus !== 'playing') return;
      const { typingChars } = currentWord;
      const idx = currentKanaIndexRef.current;
      const currentTypingChar = typingChars[idx];
      if (!currentTypingChar) return;
      if (currentTypingChar.canAccept(key)) {
        currentTypingChar.accept(key);
        const info = currentTypingChar.getDisplayInfo();
        setKanaDisplay({
          acceptedText: info.acceptedText,
          remainingText: info.remainingText,
          displayText: info.displayText
        });
        userInputRef.current += key;
        if (info.isCompleted) {
          const nextIndex = idx + 1;
          currentKanaIndexRef.current = nextIndex;
          if (nextIndex < typingChars.length) {
            const nextInfo = typingChars[nextIndex].getDisplayInfo();
            setKanaDisplay({
              acceptedText: nextInfo.acceptedText,
              remainingText: nextInfo.remainingText,
              displayText: nextInfo.displayText
            });
          } else {
            setTimeout(onWordComplete, 500);
          }
        }
        playSound('correct', 0.5);
      } else {
        playSound('wrong', 0.5);
      }
    };
    window.addEventListener('keydown', keyDownHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [currentWord, playSound]);

  return {
    setupKeydownHandler,
    kanaDisplay,
    resetProgress,
    currentKanaIndexRef,
    userInputRef
  };
};
