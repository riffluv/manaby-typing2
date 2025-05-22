import React, { memo } from 'react';
import styles from '@/styles/TypingGame.module.css';
import TypingArea from './TypingArea';
import { TypingWord, KanaDisplay } from '@/types/typing';

export type GameScreenProps = {
  currentWord: TypingWord;
  currentKanaIndex: number;
  currentKanaDisplay: KanaDisplay;
  // 今後: スコアや進捗バーなどもここで受け取る
};

const GameScreen: React.FC<GameScreenProps> = memo(({ currentWord, currentKanaIndex, currentKanaDisplay }) => {
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
      {/* 今後: スコア・進捗バー・ヒントなど拡張可能 */}
    </div>
  );
});
GameScreen.displayName = 'GameScreen';
export default GameScreen;
