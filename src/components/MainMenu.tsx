import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTypingGameStore } from '@/store/typingGameStore';
import ShortcutFooter, { Shortcut } from '@/components/ShortcutFooter';
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
  
  // ショートカット案内
  const shortcuts: Shortcut[] = [
    { key: 'Space', label: 'スタート' },
    { key: 'Alt+R', label: 'ランキング' },
    { key: 'R', label: 'リトライ' },
  ];

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
      >
        {/* ゲームロゴ/タイトル */}
        <motion.div variants={itemVariants} className={styles.logoContainer}>
          <h1 className={styles.logoText}>manaby typing</h1>
        </motion.div>
        
        {/* スタートボタン */}
        <motion.div variants={itemVariants} className={styles.startButtonContainer}>
          <motion.button
            onClick={handleStart}
            className={styles.startButton}
            whileHover={buttonVariants.hover}
            whileTap={buttonVariants.tap}
          >
            スタート
          </motion.button>
        </motion.div>
        
        {/* モード選択 */}
        <motion.div variants={itemVariants} className={styles.modeSelectionContainer}>
          <h2 className={styles.modeTitle}>モード選択</h2>
          <div className={styles.modeButtonsGrid}>
            <button
              className={`${styles.modeButton} ${selectedMode === 'normal' ? styles.modeButtonActive : styles.modeButtonInactive}`}
              onClick={() => setSelectedMode('normal')}
            >
              <span>Normal</span>
              {selectedMode === 'normal' && <span className={styles.activeIndicator}>●</span>}
            </button>
            <button
              className={`${styles.modeButton} ${selectedMode === 'hard' ? styles.modeButtonActive : styles.modeButtonInactive}`}
              onClick={() => setSelectedMode('hard')}
            >
              <span>Hard</span>
              {selectedMode === 'hard' && <span className={styles.activeIndicator}>●</span>}
            </button>
          </div>
        </motion.div>
        
        {/* バージョン情報 */}
        <motion.div variants={itemVariants} className={styles.versionInfo}>
          v2.0.0 | monkeytype UI
        </motion.div>
      </motion.div>

      <ShortcutFooter shortcuts={shortcuts} />
    </div>
  );
};

export default MainMenu;
