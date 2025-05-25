import React, { useEffect, useCallback, memo } from 'react';
import styles from '@/styles/TypingGameRefactored.module.css';
import MCPStatus from '@/components/MCPStatus';
import TypingArea from '@/components/TypingArea';
import { useTypingGameStore, useGameStatus, useDisplayWord, useCurrentWord, useCurrentWordIndex, useWordListLength } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { useTypingProcessor } from '@/hooks/useTypingProcessor';
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
      <div className={styles.typingAreaContainer}>
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
