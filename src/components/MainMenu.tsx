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
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', fontFamily: 'var(--font-ui)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            CYBER TYPING ARENA
          </p>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-2xl)',
            maxWidth: '800px',
            width: '100%',
            padding: 'var(--space-xl)'
          }}
        >
          {/* メインスタートボタン - THE FINALS風 */}
          <motion.div variants={itemVariants}>
            <motion.button
              className="btn-primary gpu-accelerated"
              onClick={handleStart}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "var(--glow-cyan), 0 0 50px rgba(0, 245, 255, 0.4)"
              }}
              whileTap={{ 
                scale: 0.98,
                boxShadow: "var(--glow-cyan)"
              }}
              style={{
                fontSize: '1.5rem',
                padding: 'var(--space-lg) var(--space-2xl)',
                minWidth: '300px',
                position: 'relative',
                overflow: 'hidden'
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
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-lg)',
              width: '100%'
            }}
          >
            <h2 style={{
              color: 'var(--color-text-primary)',
              fontSize: '1.5rem',
              fontFamily: 'var(--font-ui)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 'var(--space-md)'
            }}>
              SELECT MODE
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'var(--space-lg)',
              width: '100%',
              maxWidth: '500px'
            }}>
              <motion.button
                className="btn-secondary cyber-border"
                onClick={() => setSelectedMode('normal')}
                whileHover={{ 
                  scale: 1.03,
                  y: -2,
                  boxShadow: selectedMode === 'normal' 
                    ? "var(--glow-neon)" 
                    : "var(--glow-purple)"
                }}
                whileTap={{ scale: 0.98, y: 0 }}
                style={{
                  padding: 'var(--space-lg)',
                  position: 'relative',
                  backgroundColor: selectedMode === 'normal' 
                    ? 'rgba(57, 255, 20, 0.1)' 
                    : 'transparent',
                  borderColor: selectedMode === 'normal' 
                    ? 'var(--color-accent-neon)' 
                    : 'var(--color-accent-purple)',
                  color: selectedMode === 'normal' 
                    ? 'var(--color-accent-neon)' 
                    : 'var(--color-accent-purple)'
                }}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>NORMAL</span>
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
                className="btn-secondary cyber-border"
                onClick={() => setSelectedMode('hard')}
                whileHover={{ 
                  scale: 1.03,
                  y: -2,
                  boxShadow: selectedMode === 'hard' 
                    ? "var(--glow-error)" 
                    : "var(--glow-purple)"
                }}
                whileTap={{ scale: 0.98, y: 0 }}
                style={{
                  padding: 'var(--space-lg)',
                  position: 'relative',
                  backgroundColor: selectedMode === 'hard' 
                    ? 'rgba(255, 7, 58, 0.1)' 
                    : 'transparent',
                  borderColor: selectedMode === 'hard' 
                    ? 'var(--color-error)' 
                    : 'var(--color-accent-purple)',
                  color: selectedMode === 'hard' 
                    ? 'var(--color-error)' 
                    : 'var(--color-accent-purple)'
                }}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>HARD</span>
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
            style={{
              display: 'flex',
              gap: 'var(--space-lg)',
              marginTop: 'var(--space-xl)'
            }}
          >
            <motion.button
              className="btn-secondary"
              onClick={onRanking}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: 'var(--space-md) var(--space-lg)',
                fontSize: '1rem'
              }}
            >
              RANKING
            </motion.button>
            
            <motion.button
              className="btn-secondary"
              onClick={onRetry}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: 'var(--space-md) var(--space-lg)',
                fontSize: '1rem'
              }}
            >
              RETRY
            </motion.button>
          </motion.div>

          {/* バージョン情報 - 控えめに */}
          <motion.div 
            variants={itemVariants}
            style={{
              color: 'var(--color-text-muted)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 400,
              marginTop: 'var(--space-lg)',
              textAlign: 'center',
              letterSpacing: '0.05em'
            }}
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
