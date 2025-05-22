import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStatus, useTypingGameStore, useCurrentWord } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { TypingWord, KanaDisplay } from '@/types/typing';
import { useTypingGameLifecycle } from '@/hooks/useTypingGameLifecycle';
import MCPStatus from '@/components/MCPStatus';
import GameScreen from '@/components/GameScreen';
import styles from '@/styles/TypingGame.module.css';

const TypingGame: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
  // Zustandストアから「お題情報」「ゲーム状態」だけ購読
  const gameStatus = useGameStatus();
  const { setGameStatus, advanceToNextWord, resetGame, setupCurrentWord } = useTypingGameStore();
  const storeWord = useCurrentWord();
  const { playSound } = useAudioStore();

  // Typingゲームの初期化副作用
  useTypingGameLifecycle();

  // typingmania-ref流: 進行状態はuseRefで管理
  const typingCharsRef = useRef<TypingWord['typingChars']>([]);
  const displayCharsRef = useRef<TypingWord['displayChars']>([]);
  const kanaIndexRef = useRef<number>(0);

  // 画面表示用のみuseState
  const [kanaDisplay, setKanaDisplay] = useState<KanaDisplay>({
    acceptedText: '',
    remainingText: '',
    displayText: ''
  });
  const [currentWord, setCurrentWord] = useState<TypingWord>({
    japanese: '',
    hiragana: '',
    romaji: '',
    typingChars: [],
    displayChars: []
  });

  // お題切り替え時のみuseRefを初期化
  useEffect(() => {
    if (storeWord && storeWord.japanese !== currentWord.japanese) {
      setCurrentWord(storeWord);
      typingCharsRef.current = storeWord.typingChars;
      displayCharsRef.current = storeWord.displayChars;
      kanaIndexRef.current = 0;
      if (storeWord.typingChars.length > 0) {
        const info = storeWord.typingChars[0].getDisplayInfo();
        setKanaDisplay({
          acceptedText: info.acceptedText,
          remainingText: info.remainingText,
          displayText: info.displayText
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeWord]);

  // typingmania-ref流: キー入力はuseRefを直接ミューテート
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    const keyDownHandler = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;
      if (e.key.length !== 1) return;
      const typingChars = typingCharsRef.current;
      const idx = kanaIndexRef.current;
      const currentTypingChar = typingChars[idx];
      if (!currentTypingChar) return;
      if (currentTypingChar.canAccept(e.key)) {
        currentTypingChar.accept(e.key);
        playSound && playSound('correct');
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
            const nextInfo = typingChars[nextIdx].getDisplayInfo();
            setKanaDisplay({
              acceptedText: nextInfo.acceptedText,
              remainingText: nextInfo.remainingText,
              displayText: nextInfo.displayText
            });
          } else {
            setTimeout(() => {
              advanceToNextWord();
              // onFinishはadvanceToNextWordの中で呼ぶ
            }, 300);
          }
        }
      } else {
        // 不正解キーの場合
        playSound && playSound('wrong');
      }
    };
    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [gameStatus, advanceToNextWord, playSound]);

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
          currentKanaIndex={kanaIndexRef.current}
          currentKanaDisplay={kanaDisplay}
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

export default TypingGame;
