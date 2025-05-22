import { useState, useEffect, useRef } from 'react';
import * as wanakana from 'wanakana';
import { wordList } from '@/data/wordList';
import styles from '@/styles/TypingGame.module.css';
import { convertHiraganaToRomaji, getAllRomajiPatterns, createTypingChars, TypingChar } from '@/utils/japaneseUtils';
import { 
  playSound, playBGM, stopBGM, pauseBGM, resumeBGM, preloadAllSounds,
  setEffectsEnabled, setBGMEnabled, setEffectsVolume, setBGMVolume 
} from '@/utils/soundPlayer';
import MCPStatus from '@/components/MCPStatus';
import { useTypingStore, useCurrentKanaIndex, useUserInput, useCurrentKanaDisplay } from '@/store/typingStore';
import { useTypingGameStore, useGameStatus, useDisplayWord, useCurrentWord, useCurrentWordIndex, useWordListLength } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { useTypingProcessor } from '@/hooks/useTypingProcessor';
import React, { memo, useCallback } from 'react';

// TypingGameRefactored.tsxの構造を参考に、Zustandストアのセレクターとカスタムフックを使った構造にリファクタ
// 旧useState, useRefベースの状態管理を廃止し、Zustandストアのセレクターで必要な状態のみ購読
// キー入力処理はuseTypingProcessorカスタムフックに委譲

const TypingGame: React.FC = () => {
  // Zustandストアから必要な状態のみ購読
  const gameStatus = useGameStatus();
  const { setGameStatus, advanceToNextWord, resetGame, setupCurrentWord } = useTypingGameStore();
  const { preloadSounds } = useAudioStore();
  const { resetTypingState } = useTypingStore();
  const { setupKeydownHandler } = useTypingProcessor();

  // 初期化 - サウンドのプリロードと初期単語セットアップ
  useEffect(() => {
    preloadSounds();
    setupCurrentWord();
  }, [preloadSounds, setupCurrentWord]);

  // ゲーム開始時のキーボードイベント設定
  useEffect(() => {
    const cleanup = setupKeydownHandler(
      gameStatus as 'ready' | 'playing' | 'finished',
      () => setGameStatus('playing'),
      () => {
        resetGame();
        resetTypingState();
      },
      () => {
        advanceToNextWord();
        resetTypingState();
      }
    );
    return cleanup;
  }, [gameStatus, setGameStatus, resetGame, advanceToNextWord, setupKeydownHandler, resetTypingState]);

  // リセットハンドラ
  const handleReset = useCallback(() => {
    resetGame();
    resetTypingState();
  }, [resetGame, resetTypingState]);

  // 画面分割レンダリング
  return (
    <div className={styles.typingGameContainer}>
      {/* スタート画面 */}
      {gameStatus === 'ready' && (
        <div className={styles.startScreen}>
          <h2>タイピングゲーム</h2>
          <p>スペースキーを押してスタート</p>
        </div>
      )}
      {/* ゲーム画面 */}
      {gameStatus === 'playing' && <GameScreen />}
      {/* フィニッシュ画面 */}
      {gameStatus === 'finished' && (
        <div className={styles.finishScreen}>
          <h2>クリア！</h2>
          <p>おめでとうございます！</p>
          <button onClick={handleReset} className={styles.resetButton}>
            もう一度プレイ
          </button>
        </div>
      )}
      {/* MCPサーバー接続状態の表示 */}
      <MCPStatus position="bottom-right" />
    </div>
  );
};

const TypingArea = memo(({ 
  currentKanaIndex,
  typingChars, 
  displayChars, 
  kanaDisplay
}: { 
  currentKanaIndex: number;
  typingChars: any[];
  displayChars: string[];
  kanaDisplay: {
    acceptedText: string;
    remainingText: string;
    displayText: string;
  };
}) => {
  const getCharClass = useCallback((kanaIndex: number, charIndex: number) => {
    if (kanaIndex < currentKanaIndex) {
      return styles.completed;
    } else if (kanaIndex === currentKanaIndex) {
      const acceptedLength = kanaDisplay.acceptedText.length;
      if (charIndex < acceptedLength) {
        return styles.completed;
      } else if (charIndex === acceptedLength) {
        return styles.current;
      }
    }
    return styles.pending;
  }, [currentKanaIndex, kanaDisplay.acceptedText.length]);

  return (
    <>
      {typingChars.map((typingChar, kanaIndex) => {
        const displayText = displayChars[kanaIndex] || '';
        return (
          <span key={kanaIndex} className={styles.kanaGroup}>
            {displayText.split('').map((char, charIndex) => (
              <span key={`${kanaIndex}-${charIndex}`} className={getCharClass(kanaIndex, charIndex)}>
                {char}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
});
TypingArea.displayName = 'TypingArea';

const GameScreen = memo(() => {
  const { japanese, hiragana } = useDisplayWord();
  const currentWord = useCurrentWord();
  const currentWordIndex = useCurrentWordIndex();
  const wordListLength = useWordListLength();
  const currentKanaIndex = useCurrentKanaIndex();
  const currentKanaDisplay = useCurrentKanaDisplay();
  return (
    <div className={styles.gameScreen}>
      <div className={styles.wordJapanese}>{japanese}</div>
      <div className={styles.wordHiragana}>{hiragana}</div>
      <div className={styles.typingArea}>
        <TypingArea 
          currentKanaIndex={currentKanaIndex}
          typingChars={currentWord.typingChars}
          displayChars={currentWord.displayChars}
          kanaDisplay={currentKanaDisplay}
        />
      </div>
      <div className={styles.progress}>
        お題: {currentWordIndex + 1} / {wordListLength}
      </div>
    </div>
  );
});
GameScreen.displayName = 'GameScreen';

export default TypingGame;
