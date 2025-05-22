import React, { useEffect, useCallback, memo } from 'react';
import styles from '@/styles/TypingGame.module.css';
import MCPStatus from '@/components/MCPStatus';
import { useTypingStore, useCurrentKanaIndex, useUserInput, useCurrentKanaDisplay } from '@/store/typingStore';
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
  const { japanese, hiragana } = useDisplayWord(); // 必要な情報のみを購読
  const currentWord = useCurrentWord();
  const currentWordIndex = useCurrentWordIndex();
  const wordListLength = useWordListLength();
  const currentKanaIndex = useCurrentKanaIndex();
  const currentKanaDisplay = useCurrentKanaDisplay();

  if (gameStatus !== 'playing') return null;

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
  const { resetTypingState } = useTypingStore();
    // タイピング処理のカスタムフック
  const { setupKeydownHandler } = useTypingProcessor();
  
  // 初期化 - サウンドのプリロード
  useEffect(() => {
    preloadSounds();
    setupCurrentWord(); // 初期単語のセットアップ
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
  
  return (
    <div className={styles.typingGameContainer}>
      <StartScreen gameStatus={gameStatus} />
      <GameScreen />
      <FinishScreen gameStatus={gameStatus} onReset={handleReset} />
      
      {/* MCPサーバー接続状態の表示 */}
      <MCPStatus position="bottom-right" />
    </div>
  );
};

export default TypingGameRefactored;
