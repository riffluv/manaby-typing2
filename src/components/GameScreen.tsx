import React, { memo } from 'react';
import styles from '@/styles/TypingGame.module.css';
import TypingArea from './TypingArea';
import { TypingWord, KanaDisplay } from '@/types/typing';

export type GameScreenProps = {
  currentWord: TypingWord;
  currentKanaIndex: number;
  currentKanaDisplay: KanaDisplay;
};

const GameScreen: React.FC<GameScreenProps> = memo(({ currentWord, currentKanaIndex, currentKanaDisplay }) => {
  return (
    <div className={styles.gameScreen}>
      <div className={styles.wordJapanese} aria-label="日本語">{currentWord.japanese}</div>
      <div className={styles.wordHiragana} aria-label="ひらがな">{currentWord.hiragana}</div>
      <TypingArea 
        currentKanaIndex={currentKanaIndex}
        typingChars={currentWord.typingChars}
        displayChars={currentWord.displayChars}
        kanaDisplay={currentKanaDisplay}
      />
    </div>
  );
});
GameScreen.displayName = 'GameScreen';
export default GameScreen;
