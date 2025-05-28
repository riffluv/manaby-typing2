import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TypingArea from './TypingArea';
import { TypingWord, KanaDisplay } from '@/types';
import PortalShortcut from './PortalShortcut';
import styles from './GameScreen.module.css';

export type GameScreenProps = {
  currentWord: TypingWord;
  currentKanaIndex: number;
  currentKanaDisplay: KanaDisplay;
};

/**
 * MonkeyType + THE FINALS インスパイアード cyberpunk ゲーム画面
 * ミニマリスト + サイバーパンクの融合デザイン
 */
const GameScreen: React.FC<GameScreenProps> = memo(({ currentWord, currentKanaIndex, currentKanaDisplay }) => {

  return (
    <div className={styles.gameScreenWrapper}>
      <motion.div 
        className="game-screen"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* 日本語単語 - メイン表示 */}
        <motion.div 
          className="word-japanese"
          aria-label="日本語"
          key={`jp-${currentWord.japanese}`}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {currentWord.japanese}
        </motion.div>
        
        {/* ひらがな - サブ表示 */}
        <motion.div 
          className="word-hiragana"
          aria-label="ひらがな"
          key={`hira-${currentWord.hiragana}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {currentWord.hiragana}
        </motion.div>

        {/* ショートカット案内（ローマ字の直下・中央上部） */}
        <div style={{ margin: '0 auto', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <PortalShortcut shortcuts={[{ key: 'Esc', label: '戻る' }]} />
        </div>
        
        {/* タイピングエリア - メイン インタラクション */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <TypingArea 
            currentKanaIndex={currentKanaIndex}
            typingChars={currentWord.typingChars}
            displayChars={currentWord.displayChars}
            kanaDisplay={currentKanaDisplay}
          />
        </motion.div>
      </motion.div>
    </div>
  );
});

GameScreen.displayName = 'GameScreen';
export default GameScreen;
