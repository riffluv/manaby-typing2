import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/styles/GameScreen.module.css';
import TypingArea from './TypingArea';
import { TypingWord, KanaDisplay } from '@/types/typing';

export type GameScreenProps = {
  currentWord: TypingWord;
  currentKanaIndex: number;
  currentKanaDisplay: KanaDisplay;
};

/**
 * MonkeyType + Finals インスパイアードのモダンなゲーム画面
 */
const GameScreen: React.FC<GameScreenProps> = memo(({ currentWord, currentKanaIndex, currentKanaDisplay }) => {

  return (
    <motion.div 
      className={styles.gameScreen}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ...existing code... */}
      
      {/* 日本語単語 */}
      <motion.div 
        className={styles.wordJapanese}
        aria-label="日本語"
        key={`jp-${currentWord.japanese}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {currentWord.japanese}
      </motion.div>
      
      {/* ひらがな */}
      <motion.div 
        className={styles.wordHiragana}
        aria-label="ひらがな"
        key={`hira-${currentWord.hiragana}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {currentWord.hiragana}
      </motion.div>
      
      {/* タイピングエリア */}
      <TypingArea 
        currentKanaIndex={currentKanaIndex}
        typingChars={currentWord.typingChars}
        displayChars={currentWord.displayChars}
        kanaDisplay={currentKanaDisplay}
      />
    </motion.div>
  );
});

GameScreen.displayName = 'GameScreen';
export default GameScreen;
