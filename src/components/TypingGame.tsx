import { useState, useEffect, useCallback } from 'react';
import * as wanakana from 'wanakana';
import { wordList } from '@/data/wordList';
import styles from '@/styles/TypingGame.module.css';
import { convertHiraganaToRomaji, getAllRomajiPatterns, getRomajiCharacters, createTypingChars, TypingChar } from '@/utils/japaneseUtils';

const TypingGame: React.FC = () => {
  // 現在のお題のインデックス
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // 現在のお題
  const [currentWord, setCurrentWord] = useState({ 
    japanese: '', 
    hiragana: '',
    romaji: '',
    typingChars: [] as TypingChar[],
    // 表示用のローマ字配列
    displayChars: [] as string[]
  });
  
  // ユーザーの入力
  const [userInput, setUserInput] = useState('');
  
  // 現在の文字位置（kanaのインデックス）
  const [currentKanaIndex, setCurrentKanaIndex] = useState(0);
  
  // 表示するステータス
  const [gameStatus, setGameStatus] = useState<'ready' | 'playing' | 'finished'>('ready');

  // 現在のかな文字の表示情報
  const [currentKanaDisplay, setCurrentKanaDisplay] = useState({
    acceptedText: '',
    remainingText: '',
    displayText: ''
  });
  
  // お題をセットアップ
  useEffect(() => {
    if (wordList.length > 0) {
      const word = wordList[currentWordIndex];
      // タイピング文字オブジェクトの配列を作成
      const typingChars = createTypingChars(word.hiragana);
      // 表示用のローマ字の配列を作成
      const displayChars = typingChars.map(char => char.getDisplayInfo().displayText);
      
      setCurrentWord({
        japanese: word.japanese,
        hiragana: word.hiragana,
        romaji: displayChars.join(''),
        typingChars: typingChars,
        displayChars: displayChars
      });
      
      setUserInput('');
      setCurrentKanaIndex(0);
      
      if (typingChars.length > 0) {
        const currentInfo = typingChars[0].getDisplayInfo();
        setCurrentKanaDisplay({
          acceptedText: currentInfo.acceptedText,
          remainingText: currentInfo.remainingText,
          displayText: currentInfo.displayText
        });
      }
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

    // 現在入力中のかな文字オブジェクト
    const currentTypingChar = currentWord.typingChars[currentKanaIndex];
    if (!currentTypingChar) return;
    
    // 入力が有効かどうかチェック
    if (currentTypingChar.canAccept(e.key)) {
      // 正しい入力の場合
      currentTypingChar.accept(e.key);
      
      // 現在の表示情報を更新
      const currentInfo = currentTypingChar.getDisplayInfo();
      setCurrentKanaDisplay({
        acceptedText: currentInfo.acceptedText,
        remainingText: currentInfo.remainingText,
        displayText: currentInfo.displayText
      });
      
      // ユーザー入力を更新
      setUserInput(prev => prev + e.key);
      
      // かなが完了したかチェック
      if (currentInfo.isCompleted) {
        // 次のかなへ
        const nextIndex = currentKanaIndex + 1;
        setCurrentKanaIndex(nextIndex);
        
        // 次のかなの表示情報を更新
        if (nextIndex < currentWord.typingChars.length) {
          const nextInfo = currentWord.typingChars[nextIndex].getDisplayInfo();
          setCurrentKanaDisplay({
            acceptedText: nextInfo.acceptedText,
            remainingText: nextInfo.remainingText,
            displayText: nextInfo.displayText
          });
        } else {
          // お題がすべて完了した場合
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
    }
  }, [currentKanaIndex, currentWord, currentWordIndex, gameStatus]);

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
    setCurrentKanaIndex(0);
    setGameStatus('ready');
  };

  // 各文字のスタイルを決定（かな単位ではなく、表示テキスト単位）
  const getCharClass = (kanaIndex: number, charIndex: number, char: string) => {
    if (kanaIndex < currentKanaIndex) {
      return styles.completed; // 入力済みのかな
    } else if (kanaIndex === currentKanaIndex) {
      const currentInfo = currentWord.typingChars[kanaIndex].getDisplayInfo();
      const acceptedLength = currentInfo.acceptedText.length;
      
      if (charIndex < acceptedLength) {
        return styles.completed; // 入力済みの文字
      } else if (charIndex === acceptedLength) {
        return styles.current; // 現在の文字
      }
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
          <div className={styles.wordHiragana}>{currentWord.hiragana}</div>
          
          <div className={styles.typingArea}>
            {currentWord.typingChars.map((typingChar, kanaIndex) => {
              // 各かなに対応するローマ字表示
              const displayText = currentWord.displayChars[kanaIndex] || '';
              
              return (
                <span key={kanaIndex} className={styles.kanaGroup}>
                  {displayText.split('').map((char, charIndex) => (
                    <span 
                      key={`${kanaIndex}-${charIndex}`} 
                      className={getCharClass(kanaIndex, charIndex, char)}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              );
            })}
          </div>

          <div className={styles.progress}>
            お題: {currentWordIndex + 1} / {wordList.length}
          </div>
        </div>
      )}

      {gameStatus === 'finished' && (
        <div className={styles.finishScreen}>
          <h2>クリア！</h2>
          <p>おめでとうございます！</p>          <button onClick={resetGame} className={styles.resetButton}>
            もう一度プレイ
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingGame;