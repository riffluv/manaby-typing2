import PortalShortcut from '@/components/PortalShortcut';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTypingGameStore } from '@/store/typingGameStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import screenStyles from './common/ScreenWrapper.module.css';
import styles from './MainMenu.module.css';

interface MainMenuProps {
  onStart: () => void;
  onRetry: () => void;
  onRanking: () => void;
}

/**
 * monkeytype × THE FINALS インスパイアード メインメニュー
 * サイバーパンク美学とミニマリズムを融合したプロゲーマー向けUI
 */
const MainMenu: React.FC<MainMenuProps> = ({ onStart, onRetry, onRanking }) => {
  const { resetGame, setGameStatus, setMode } = useTypingGameStore();
  const [selectedMode, setSelectedMode] = useState<'normal' | 'hard'>('normal');

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
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  const glitchVariants = {
    hover: {
      textShadow: [
        "0 0 10px var(--color-accent-cyan)",
        "2px 0 0 var(--color-error), -2px 0 0 var(--color-accent-neon)",
        "0 0 10px var(--color-accent-cyan)"
      ],
      transition: { duration: 0.3, times: [0, 0.5, 1] }
    }
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
    <div className={screenStyles.screenWrapper}>
      <div className={styles.mainMenuContainer}>
        {/* ゲームロゴ/タイトル */}
        <div className={styles.mainMenuHeader}>
          <h1 className={styles.mainMenuTitle}>
            manabytype
          </h1>
          <p className={styles.menuTitleSub}>
            CYBER TYPING ARENA
          </p>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className={styles.menuContent}
        >
          {/* メインスタートボタン - THE FINALS風 */}
          <motion.div variants={itemVariants}>
            <motion.button
              className={`btn-primary gpu-accelerated ${styles.menuStartButton}`}
              onClick={handleStart}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "var(--glow-cyan), 0 0 3.125rem rgba(0, 245, 255, 0.4)"
              }}
              whileTap={{ 
                scale: 0.98,
                boxShadow: "var(--glow-cyan)"
              }}
            >
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
              >
                START GAME
              </motion.span>
              
              {/* ボタン内グリッチエフェクト */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                  pointerEvents: 'none'
                }}
                animate={{
                  left: ['100%', '-100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </motion.button>
          </motion.div>

          {/* モード選択 - サイバーパンク風 */}
          <motion.div 
            variants={itemVariants}
            className={styles.menuModeSection}
          >
            <h2 className={styles.menuModeTitle}>
              SELECT MODE
            </h2>
            <div className={styles.menuModeGrid}>
              <motion.button
                className={`btn-secondary cyber-border ${styles.menuModeButton} ${selectedMode === 'normal' ? styles.menuModeButtonNormal : styles.menuModeButtonInactiveNormal}`}
                onClick={() => setSelectedMode('normal')}
                whileHover={{ 
                  scale: 1.03,
                  y: -2,
                  boxShadow: selectedMode === 'normal' 
                    ? "var(--glow-neon)" 
                    : "var(--glow-purple)"
                }}
                whileTap={{ scale: 0.98, y: 0 }}
              >
                <span className={styles.menuModeButtonLabel}>NORMAL</span>
                {selectedMode === 'normal' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: 'var(--space-md)',
                      transform: 'translateY(-50%)',
                      width: '8px',
                      height: '8px',
                      background: 'var(--color-accent-neon)',
                      borderRadius: '50%',
                      boxShadow: 'var(--glow-neon)'
                    }}
                  />
                )}
              </motion.button>

              <motion.button
                className={`btn-secondary cyber-border ${styles.menuModeButton} ${selectedMode === 'hard' ? styles.menuModeButtonHard : styles.menuModeButtonInactiveHard}`}
                onClick={() => setSelectedMode('hard')}
                whileHover={{ 
                  scale: 1.03,
                  y: -2,
                  boxShadow: selectedMode === 'hard' 
                    ? "var(--glow-error)" 
                    : "var(--glow-purple)"
                }}
                whileTap={{ scale: 0.98, y: 0 }}
              >
                <span className={styles.menuModeButtonLabel}>HARD</span>
                {selectedMode === 'hard' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: 'var(--space-md)',
                      transform: 'translateY(-50%)',
                      width: '8px',
                      height: '8px',
                      background: 'var(--color-error)',
                      borderRadius: '50%',
                      boxShadow: 'var(--glow-error)'
                    }}
                  />
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* サブメニューボタン */}
          <motion.div 
            variants={itemVariants}
            className={styles.menuSubButtons}
          >
            <motion.button
              className={`btn-secondary ${styles.menuSubButton}`}
              onClick={onRanking}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              RANKING
            </motion.button>
            <motion.button
              className={`btn-secondary ${styles.menuSubButton}`}
              onClick={onRetry}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              RETRY
            </motion.button>
          </motion.div>

          {/* バージョン情報 - 控えめに */}
          <motion.div 
            variants={itemVariants}
            className={styles.menuVersion}
          >
            <motion.span
              whileHover={{ 
                color: 'var(--color-accent-cyan)',
                textShadow: 'var(--glow-cyan)'
              }}
            >
              v2.0.0 | monkeytype × THE FINALS
            </motion.span>
          </motion.div>
        </motion.div>
      </div>

      {/* ショートカットヘルプ */}
      <PortalShortcut shortcuts={[
        { key: 'Space', label: 'Start Game' },
        { key: 'Alt+R', label: 'Ranking' },
        { key: 'R', label: 'Retry' }
      ]} />
    </div>
  );
};

export default MainMenu;
