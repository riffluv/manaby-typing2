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
  // Zustandストアから「お題情報」「ゲーム状態」だけ購読
  const gameStatus = useGameStatus();
  const { setGameStatus, advanceToNextWord, resetGame, setupCurrentWord } = useTypingGameStore();
  const { preloadSounds } = useAudioStore();
  // useCurrentWordは関数本体で呼び出す
  const storeWord = useCurrentWord();

  // ローカル状態（useRef）で進行管理
  const [currentWord, setCurrentWord] = useState({
    japanese: '',
    hiragana: '',
    romaji: '',
    typingChars: [] as TypingChar[],
    displayChars: [] as string[]
  });
  const [currentKanaIndex, setCurrentKanaIndex] = useState(0);
  const [currentKanaDisplay, setCurrentKanaDisplay] = useState({
    acceptedText: '',
    remainingText: '',
    displayText: ''
  });

  // お題切り替え時のみストアから情報取得
  useEffect(() => {
    if (gameStatus === 'playing' || gameStatus === 'ready') {
      setCurrentWord(storeWord);
      setCurrentKanaIndex(0);
      if (storeWord.typingChars.length > 0) {
        const info = storeWord.typingChars[0].getDisplayInfo();
        setCurrentKanaDisplay({
          acceptedText: info.acceptedText,
          remainingText: info.remainingText,
          displayText: info.displayText
        });
      }
    }
  }, [gameStatus, storeWord]);

  // --- 打撃音再生 ---
  // useAudioStoreからplaySoundを取得
  const { playSound } = useAudioStore();

  // キー入力処理はローカルで完結
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    const keyDownHandler = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;
      if (e.key.length !== 1) return;
      const typingChars = currentWord.typingChars;
      const idx = currentKanaIndex;
      const currentTypingChar = typingChars[idx];
      if (!currentTypingChar) return;
      if (currentTypingChar.canAccept(e.key)) {
        currentTypingChar.accept(e.key);
        playSound && playSound('correct'); // 打撃音を再生
        const info = currentTypingChar.getDisplayInfo();
        setCurrentKanaDisplay({
          acceptedText: info.acceptedText,
          remainingText: info.remainingText,
          displayText: info.displayText
        });
        // かなが完了したら次へ
        if (info.isCompleted) {
          const nextIdx = idx + 1;
          setCurrentKanaIndex(nextIdx);
          if (nextIdx < typingChars.length) {
            const nextInfo = typingChars[nextIdx].getDisplayInfo();
            setCurrentKanaDisplay({
              acceptedText: nextInfo.acceptedText,
              remainingText: nextInfo.remainingText,
              displayText: nextInfo.displayText
            });
          } else {
            setTimeout(() => {
              advanceToNextWord();
            }, 300);
          }
        }
      }
    };
    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [gameStatus, currentWord, currentKanaIndex, advanceToNextWord]);

  // スペースキーでゲーム開始
  useEffect(() => {
    if (gameStatus !== 'ready') return;
    const keyDownHandler = (e: KeyboardEvent) => {
      if (gameStatus === 'ready' && (e.key === ' ' || e.code === 'Space')) {
        e.preventDefault();
        setGameStatus('playing');
      }
    };
    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [gameStatus, setGameStatus]);

  // サウンドプリロード・お題初期化
  useEffect(() => {
    preloadSounds();
    setupCurrentWord();
  }, [preloadSounds, setupCurrentWord]);

  // リセットハンドラ
  const handleReset = useCallback(() => {
    resetGame();
    setupCurrentWord();
  }, [resetGame, setupCurrentWord]);

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
      {gameStatus === 'playing' && (
        <GameScreen
          currentWord={currentWord}
          currentKanaIndex={currentKanaIndex}
          currentKanaDisplay={currentKanaDisplay}
        />
      )}
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

// TypingArea, GameScreen もprops受け取り型に修正
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

const GameScreen = memo(({ currentWord, currentKanaIndex, currentKanaDisplay }: any) => {
  return (
    <div className={styles.gameScreen}>
      <div className={styles.wordJapanese}>{currentWord.japanese}</div>
      <div className={styles.wordHiragana}>{currentWord.hiragana}</div>
      <div className={styles.typingArea}>
        <TypingArea 
          currentKanaIndex={currentKanaIndex}
          typingChars={currentWord.typingChars}
          displayChars={currentWord.displayChars}
          kanaDisplay={currentKanaDisplay}
        />
      </div>
      <div className={styles.progress}>
        お題: {/* ...お題番号表示... */}
      </div>
    </div>
  );
});
GameScreen.displayName = 'GameScreen';

export default TypingGame;
