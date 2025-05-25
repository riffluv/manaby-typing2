import React, { useEffect, useCallback, memo } from 'react';
import styles from '@/styles/TypingGameRefactored.module.css';
import MCPStatus from '@/components/MCPStatus';
import { useTypingGameStore, useGameStatus, useDisplayWord, useCurrentWord, useCurrentWordIndex, useWordListLength } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { useTypingProcessor } from '@/hooks/useTypingProcessor';

// タイピングエリアのレンダリングコンポーネント（メモ化）
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
  // 文字のスタイルを決定
  const getCharClass = useCallback((kanaIndex: number, charIndex: number) => {
    if (kanaIndex < currentKanaIndex) {
      return styles.completed; // 入力済みのかな
    } else if (kanaIndex === currentKanaIndex) {
      const acceptedLength = kanaDisplay.acceptedText.length;
      
      if (charIndex < acceptedLength) {
        return styles.completed; // 入力済みの文字
      } else if (charIndex === acceptedLength) {
        return styles.current; // 現在の文字
      }
    }
    return styles.pending; // 未入力
  }, [currentKanaIndex, kanaDisplay.acceptedText.length]);

  return (
    <>
      {typingChars.map((typingChar, kanaIndex) => {
        // 各かなに対応するローマ字表示
        const displayText = displayChars[kanaIndex] || '';
        
        return (
          <span key={kanaIndex} className={styles.kanaGroup}>
            {displayText.split('').map((char, charIndex) => (
              <span 
                key={`${kanaIndex}-${charIndex}`} 
                className={getCharClass(kanaIndex, charIndex)}
              >
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

// ゲーム画面全体（メモ化）
const GameScreen = memo(() => {
  const gameStatus = useGameStatus();
  const { japanese, hiragana } = useDisplayWord();
  const currentWord = useCurrentWord();
  const currentWordIndex = useCurrentWordIndex();
  const wordListLength = useWordListLength();
  // 進行状態はuseTypingProcessorから取得
  const { kanaDisplay, currentKanaIndexRef } = useTypingProcessor();

  if (gameStatus !== 'playing') return null;

  return (
    <div className={styles.gameScreen}>
      <div className={styles.wordJapanese}>{japanese}</div>
      <div className={styles.wordHiragana}>{hiragana}</div>
      <div className={styles.typingArea}>
        <TypingArea 
          currentKanaIndex={currentKanaIndexRef.current}
          typingChars={currentWord.typingChars}
          displayChars={currentWord.displayChars}
          kanaDisplay={kanaDisplay}
        />
      </div>
      <div className={styles.progress}>
        お題: {currentWordIndex + 1} / {wordListLength}
      </div>
    </div>
  );
});
GameScreen.displayName = 'GameScreen';

// スタート画面（メモ化）
const StartScreen = memo(({ gameStatus }: { gameStatus: string }) => {
  if (gameStatus !== 'ready') return null;
  
  return (
    <div className={styles.startScreen}>
      <h2>タイピングゲーム</h2>
      <p>スペースキーを押してスタート</p>
    </div>
  );
});
StartScreen.displayName = 'StartScreen';

// フィニッシュ画面（メモ化）
const FinishScreen = memo(({ gameStatus, onReset }: { gameStatus: string, onReset: () => void }) => {
  if (gameStatus !== 'finished') return null;
  
  return (
    <div className={styles.finishScreen}>
      <h2>クリア！</h2>
      <p>おめでとうございます！</p>
      <button onClick={onReset} className={styles.resetButton}>
        もう一度プレイ
      </button>
    </div>
  );
});
FinishScreen.displayName = 'FinishScreen';

// メインのタイピングゲームコンポーネント
const TypingGameRefactored: React.FC = () => {
  // Zustandストアからの状態とアクション
  const gameStatus = useGameStatus();
  const { setGameStatus, advanceToNextWord, resetGame, setupCurrentWord } = useTypingGameStore();
  const { preloadSounds } = useAudioStore();
  // 進行状態管理はuseTypingProcessorで
  const { setupKeydownHandler, resetProgress } = useTypingProcessor();

  useEffect(() => {
    preloadSounds();
    setupCurrentWord();
    resetProgress(); // お題切り替え時に進行状態リセット
  }, [preloadSounds, setupCurrentWord, resetProgress]);

  useEffect(() => {
    const cleanup = setupKeydownHandler(
      gameStatus as 'ready' | 'playing' | 'finished',
      () => setGameStatus('playing'),
      () => {
        resetGame();
        resetProgress();
      },
      () => {
        advanceToNextWord();
        resetProgress();
      }
    );
    return cleanup;
  }, [gameStatus, setGameStatus, resetGame, advanceToNextWord, setupKeydownHandler, resetProgress]);

  const handleReset = useCallback(() => {
    resetGame();
    resetProgress();
  }, [resetGame, resetProgress]);

  return (
    <div className={styles.typingGameContainer}>
      <StartScreen gameStatus={gameStatus} />
      <GameScreen />
      <FinishScreen gameStatus={gameStatus} onReset={handleReset} />
      <MCPStatus position="bottom-right" />
    </div>
  );
};

export default TypingGameRefactored;
