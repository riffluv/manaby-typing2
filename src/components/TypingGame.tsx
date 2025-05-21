import { useState, useEffect, useCallback } from 'react';
import * as wanakana from 'wanakana';
import { wordList } from '@/data/wordList';
import styles from '@/styles/TypingGame.module.css';

const TypingGame: React.FC = () => {
  // 現在のお題のインデックス
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  // 現在のお題
  const [currentWord, setCurrentWord] = useState({ 
    japanese: '', 
    hiragana: '', 
    romaji: '' 
  });
  // ユーザーの入力
  const [userInput, setUserInput] = useState('');
  // 現在の文字位置
  const [currentPosition, setCurrentPosition] = useState(0);
  // 表示するステータス
  const [gameStatus, setGameStatus] = useState<'ready' | 'playing' | 'finished'>('ready');

  // お題をセットアップ
  useEffect(() => {
    if (wordList.length > 0) {
      const word = wordList[currentWordIndex];
      // wanakanaを使ってひらがなをローマ字に変換
      const romaji = wanakana.toRomaji(word.hiragana);
      setCurrentWord({
        japanese: word.japanese,
        hiragana: word.hiragana,
        romaji: romaji
      });
      setUserInput('');
      setCurrentPosition(0);
    }
  }, [currentWordIndex]);

  // キー入力を処理
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // ゲームがプレイ中でない場合はスペースキーでスタート
    if (gameStatus !== 'playing') {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setGameStatus('playing');
      }
      return;
    }

    // ESCキーでゲームリセット
    if (e.key === 'Escape') {
      resetGame();
      return;
    }

    // 入力文字が現在の位置の文字と一致するか確認
    if (e.key === currentWord.romaji[currentPosition]) {
      // 正しい入力の場合
      setUserInput(prev => prev + e.key);
      setCurrentPosition(prev => prev + 1);

      // お題をクリアした場合
      if (currentPosition + 1 >= currentWord.romaji.length) {
        if (currentWordIndex + 1 < wordList.length) {
          // 次のお題へ
          setTimeout(() => {
            setCurrentWordIndex(prev => prev + 1);
          }, 500);
        } else {
          // ゲーム終了
          setGameStatus('finished');
        }
      }
    }
  }, [currentPosition, currentWord, currentWordIndex, gameStatus]);

  // ゲーム開始時にキーボードイベントをセット
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // ゲームをリセット
  const resetGame = () => {
    setCurrentWordIndex(0);
    setUserInput('');
    setCurrentPosition(0);
    setGameStatus('ready');
  };

  // 各文字のスタイルを決定
  const getCharClass = (index: number) => {
    if (index < currentPosition) {
      return styles.completed; // 入力済み
    } else if (index === currentPosition) {
      return styles.current; // 現在の位置
    }
    return styles.pending; // 未入力
  };

  return (
    <div className={styles.typingGameContainer}>
      {gameStatus === 'ready' && (
        <div className={styles.startScreen}>
          <h2>タイピングゲーム</h2>
          <p>スペースキーを押してスタート</p>
        </div>
      )}

      {gameStatus === 'playing' && (
        <div className={styles.gameScreen}>
          <div className={styles.wordJapanese}>{currentWord.japanese}</div>
          
          <div className={styles.typingArea}>
            {currentWord.romaji.split('').map((char, index) => (
              <span 
                key={index} 
                className={getCharClass(index)}
              >
                {char}
              </span>
            ))}
          </div>

          <div className={styles.progress}>
            お題: {currentWordIndex + 1} / {wordList.length}
          </div>
        </div>
      )}

      {gameStatus === 'finished' && (
        <div className={styles.finishScreen}>
          <h2>クリア！</h2>
          <p>おめでとうございます！</p>
          <button onClick={resetGame} className={styles.resetButton}>
            もう一度プレイ
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingGame;