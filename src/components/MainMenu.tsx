import MinimalShortcut from '@/components/MinimalShortcut';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTypingGameStore } from '@/store/typingGameStore';

import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { containerVariants, itemVariants, buttonVariants } from '@/styles/animations';
import styles from '@/styles/MainMenu.module.css';

interface MainMenuProps {
  onStart: () => void;
  onRanking: () => void;
  onRetry: () => void;
}

/**
 * メインメニュー画面コンポーネント
 */
const MainMenu: React.FC<MainMenuProps> = ({ onStart, onRanking, onRetry }) => {
  const { resetGame, setGameStatus, setMode } = useTypingGameStore();
  const [selectedMode, setSelectedMode] = useState<'normal' | 'hard'>('normal');

  // ゲーム開始ハンドラー
  const handleStart = () => {
    resetGame();
    setMode(selectedMode);
    setGameStatus('playing');
    onStart();
  };
  


  // ショートカット定義
  useGlobalShortcuts([
    {
      key: ' ',
      handler: (e) => { e.preventDefault(); handleStart(); },
    },
    {
      key: 'r',
      altKey: true,
      handler: (e) => { e.preventDefault(); onRanking(); },
    },
    {
      key: 'r',
      handler: (e) => { e.preventDefault(); onRetry(); },
    },
  ], [handleStart, onRanking, onRetry]);

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.mainContent}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >        {/* ゲームロゴ/タイトル */}
        <motion.div variants={itemVariants} className={styles.MainMenu_logoContainer}>
          <h1 className={styles.MainMenu_logoText}>manaby typing</h1>
        </motion.div>
          {/* スタートボタン */}
        <motion.div variants={itemVariants} className={styles.MainMenu_startButtonContainer}>
          <motion.button
            onClick={handleStart}
            className={styles.MainMenu_startButton}
            whileHover={buttonVariants.hover}
            whileTap={buttonVariants.tap}
          >
            スタート
          </motion.button>
        </motion.div>
          {/* モード選択 */}
        <motion.div variants={itemVariants} className={styles.MainMenu_modeSelectionContainer}>
          <h2 className={styles.MainMenu_modeTitle}>モード選択</h2>
          <div className={styles.MainMenu_modeButtonsGrid}>            <button
              className={`${styles.MainMenu_modeButton} ${selectedMode === 'normal' ? styles.MainMenu_modeButtonActive : styles.MainMenu_modeButtonInactive}`}
              onClick={() => setSelectedMode('normal')}
            >
              <span>Normal</span>
              {selectedMode === 'normal' && <span className={styles.MainMenu_activeIndicator}>●</span>}
            </button>
            <button
              className={`${styles.MainMenu_modeButton} ${selectedMode === 'hard' ? styles.MainMenu_modeButtonActive : styles.MainMenu_modeButtonInactive}`}
              onClick={() => setSelectedMode('hard')}
            >
              <span>Hard</span>
              {selectedMode === 'hard' && <span className={styles.MainMenu_activeIndicator}>●</span>}
            </button>
          </div>
        </motion.div>
          {/* バージョン情報 */}
        <motion.div variants={itemVariants} className={styles.MainMenu_versionInfo}>
          v2.0.0 | monkeytype UI
        </motion.div>
      </motion.div>

      {/* <ShortcutFooter shortcuts={shortcuts} /> */}
      {/* メインメニュー用ショートカット（Space, Alt+R, Esc） */}
      <MinimalShortcut shortcuts={[
        { key: 'Space', label: 'スタート' },
        { key: ['Alt', 'R'], label: 'ランキング' },
        { key: 'Esc', label: '戻る' }
      ]} />
    </div>
  );
};

export default MainMenu;
