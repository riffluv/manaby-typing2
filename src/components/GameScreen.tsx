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
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [previousWord, setPreviousWord] = useState<string>('');
  
  // 新しい単語が表示された時にアニメーション効果
  useEffect(() => {
    if (previousWord && previousWord !== currentWord.japanese) {
      // 単語が変わった場合の処理
      const accuracy = currentKanaDisplay?.acceptedText?.length || 0;
      if (accuracy > 0) {
        // フィードバック表示
        setFeedbackText('Nice!');
        setShowFeedback(true);
        
        // 3秒後に非表示
        const timer = setTimeout(() => {
          setShowFeedback(false);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
    
    setPreviousWord(currentWord.japanese);
  }, [currentWord.japanese, currentKanaDisplay, previousWord]);

  return (
    <motion.div 
      className={styles.gameScreen}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* フィードバック表示 */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className={`${styles.typingFeedback} ${styles.typingFeedbackVisible}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {feedbackText}
          </motion.div>
        )}
      </AnimatePresence>
      
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
