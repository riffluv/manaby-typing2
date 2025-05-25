import MinimalShortcut from '@/components/MinimalShortcut';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTypingGameStore } from '@/store/typingGameStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import styles from '@/styles/MainMenu.module.css';

interface MainMenuProps {
  onStart: () => void;
  onRanking: () => void;
  onRetry: () => void;
}

/**
 * モダンなメインメニュー画面コンポーネント（MonkeyTypeとFinalsのデザインを参考）
 */
const MainMenu: React.FC<MainMenuProps> = ({ onStart, onRanking, onRetry }) => {
  const { resetGame, setGameStatus, setMode } = useTypingGameStore();
  const [selectedMode, setSelectedMode] = useState<'normal' | 'hard'>('normal');
  const [logoHovered, setLogoHovered] = useState(false);

  // ゲーム開始ハンドラー
  const handleStart = () => {
    resetGame();
    setMode(selectedMode);
    setGameStatus('playing');
    onStart();
  };
  
  // アニメーションのバリアント定義
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const logoVariants = {
    hover: {
      scale: 1.02,
      color: "#7cffcb",
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.03, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } }
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
      >
        {/* ゲームロゴ/タイトル */}
        <motion.div 
          variants={itemVariants} 
          className={styles.MainMenu_logoContainer}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className={styles.MainMenu_logoText}
            variants={logoVariants}
            whileHover="hover"
            onHoverStart={() => setLogoHovered(true)}
            onHoverEnd={() => setLogoHovered(false)}
          >
            manaby typing
          </motion.h1>
        </motion.div>

        {/* スタートボタン */}
        <motion.div 
          variants={itemVariants} 
          className={styles.MainMenu_startButtonContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        >
          <motion.button
            onClick={handleStart}
            className={styles.MainMenu_startButton}
            whileHover={{ 
              scale: 1.03, 
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)" 
            }}
            whileTap={{ scale: 0.98, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}
          >
            スタート
          </motion.button>
        </motion.div>

        {/* モード選択 */}
        <motion.div 
          variants={itemVariants} 
          className={styles.MainMenu_modeSelectionContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
        >
          <h2 className={styles.MainMenu_modeTitle}>モード選択</h2>
          <div className={styles.MainMenu_modeButtonsGrid}>
            <motion.button
              className={`${styles.MainMenu_modeButton} ${selectedMode === 'normal' ? styles.MainMenu_modeButtonActive : styles.MainMenu_modeButtonInactive}`}
              onClick={() => setSelectedMode('normal')}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span>Normal</span>
              {selectedMode === 'normal' && <span className={styles.MainMenu_activeIndicator}></span>}
            </motion.button>
            <motion.button
              className={`${styles.MainMenu_modeButton} ${selectedMode === 'hard' ? styles.MainMenu_modeButtonActive : styles.MainMenu_modeButtonInactive}`}
              onClick={() => setSelectedMode('hard')}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span>Hard</span>
              {selectedMode === 'hard' && <span className={styles.MainMenu_activeIndicator}></span>}
            </motion.button>
          </div>
        </motion.div>

        {/* バージョン情報 */}
        <motion.div 
          variants={itemVariants} 
          className={styles.MainMenu_versionInfo}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          v2.0.0 | Monkeytype × Finals
        </motion.div>
      </motion.div>

      {/* メインメニュー用ショートカット（Space, Alt+R, Esc） */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <MinimalShortcut shortcuts={[
          { key: 'Space', label: 'スタート' },
          { key: ['Alt', 'R'], label: 'ランキング' },
          { key: 'Esc', label: '戻る' }
        ]} />
      </motion.div>
    </div>
  );
};

export default MainMenu;
