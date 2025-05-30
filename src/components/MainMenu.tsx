import PortalShortcut from '@/components/PortalShortcut';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTypingGameStore, useQuestionCount } from '@/store/typingGameStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import screenStyles from './common/ScreenWrapper.module.css';
import styles from './MainMenu.module.css';
import { deleteRankingEntriesByMode } from '@/lib/rankingManaby2';
import CommonModal from './common/CommonModal';
import CommonButton from './common/CommonButton';
import UnifiedAudioSystem from '@/utils/UnifiedAudioSystem';

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
  const { resetGame, setGameStatus, setMode, setQuestionCount, mode } = useTypingGameStore();
  const questionCount = useQuestionCount();
  // 管理者モード状態
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminInput, setAdminInput] = useState(questionCount);
  const [adminStatus, setAdminStatus] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  // manabyメニュー状態のみuseState
  const [manabyMenuOpen, setManabyMenuOpen] = useState(false);

  // ゲーム開始ハンドラー
  const handleStart = async () => {
    await UnifiedAudioSystem.initialize();
    await UnifiedAudioSystem.resumeAudioContext();
    resetGame();
    setGameStatus('playing');
    onStart();
  };

  // manabyお題選択時の処理
  const handleManabyMode = (m: 'sonkeigo' | 'kenjougo' | 'business') => {
    setMode(m);
    setManabyMenuOpen(false);
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
      handler: async (e) => {
        if (adminOpen) return; // 管理者モーダルが開いているときは無効化
        e.preventDefault();
        await handleStart();
      },
    },
    {
      key: 'r',
      altKey: true,
      handler: (e) => { if (!adminOpen) { e.preventDefault(); onRanking(); } },
    },
    {
      key: '@',
      ctrlKey: true,
      handler: (e) => {
        e.preventDefault();
        setAdminOpen((v) => !v);
      },
      allowInputFocus: true
    },
  ], [handleStart, onRanking, adminOpen]);
  // ランキングリセット関数
  const handleResetRanking = async (mode: 'normal' | 'hard') => {
    setAdminLoading(true);
    setAdminStatus(`${mode.toUpperCase()}ランキングをリセット中...`);
    try {
      const count = await deleteRankingEntriesByMode(mode);
      setAdminStatus(`${mode.toUpperCase()}ランキングを${count}件リセットしました`);
    } catch (e) {
      setAdminStatus(`${mode.toUpperCase()}ランキングリセット失敗`);
    } finally {
      setAdminLoading(false);
    }
  };

  // 管理者モーダルの外側クリックで閉じる
  const handleAdminOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setAdminOpen(false);
    }
  };

  // manabyメニューの外側クリックやESCで閉じる
  React.useEffect(() => {
    if (!manabyMenuOpen) return;
    const handleClose = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && (e.key === 'Escape' || e.key === 'Esc' || e.key === 's')) {
        setManabyMenuOpen(false);
      }
      if (e instanceof MouseEvent) {
        const dropdown = document.getElementById('manaby-dropdown');
        if (dropdown && !dropdown.contains(e.target as Node)) {
          setManabyMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClose);
    document.addEventListener('keydown', handleClose);
    return () => {
      document.removeEventListener('mousedown', handleClose);
      document.removeEventListener('keydown', handleClose);
    };
  }, [manabyMenuOpen]);

  return (
    <div className={screenStyles.screenWrapper}>
      {/* 管理者モーダル（共通モーダルに統一） */}
      <CommonModal open={adminOpen} onClose={() => setAdminOpen(false)}>
        <h2>管理者モード</h2>
        <label>
          出題数：
          <input
            type="number"
            min={1}
            max={100}
            value={adminInput}
            onChange={e => setAdminInput(Number(e.target.value))}
            disabled={adminLoading}
          />
          <CommonButton
            onClick={() => { setQuestionCount(adminInput); setAdminStatus(`出題数を${adminInput}問に変更しました`); }}
            disabled={adminLoading || adminInput < 1}
            variant="secondary"
          >反映</CommonButton>
        </label>
        <div>
          <CommonButton
            onClick={() => handleResetRanking('normal')}
            disabled={adminLoading}
            variant="secondary"
          >NORMALランキングリセット</CommonButton>
          <CommonButton
            onClick={() => handleResetRanking('hard')}
            disabled={adminLoading}
            variant="secondary"
          >HARDランキングリセット</CommonButton>
        </div>
        {/* <div className="admin-actions" style={{ marginTop: 8 }}>
          <CommonButton
            onClick={() => handleResetRanking('sonkeigo')}
            disabled={adminLoading}
            variant="secondary"
            style={{ marginRight: 8 }}
          >尊敬語ランキングリセット</CommonButton>
          <CommonButton
            onClick={() => handleResetRanking('kenjougo')}
            disabled={adminLoading}
            variant="secondary"
            style={{ marginRight: 8 }}
          >謙譲語ランキングリセット</CommonButton>
        </div>
        <div className="admin-actions" style={{ marginTop: 8 }}>
          <CommonButton
            onClick={() => handleResetRanking('business')}
            disabled={adminLoading}
            variant="secondary"
          >ビジネスマナーランキングリセット</CommonButton>
        </div> */}
        <div className={styles['admin-status']}>{adminStatus}</div>
      </CommonModal>

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
            <div className={styles.menuModeGrid}>              <motion.button
                className={`btn-secondary cyber-border ${mode === 'normal' ? styles.menuModeButtonNormal : styles.menuModeButtonInactiveNormal}`}
                onClick={() => setMode('normal')}
                whileHover={{ 
                  scale: 1.03,
                  y: -2,
                  boxShadow: mode === 'normal'
                    ? "var(--glow-neon)" 
                    : "var(--glow-purple)"
                }}
                whileTap={{ scale: 0.98, y: 0 }}
              >
                <span className={styles.menuModeButtonLabel}>NORMAL</span>
                {mode === 'normal' && (
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
              </motion.button>              <motion.button
                className={`btn-secondary cyber-border ${mode === 'hard' ? styles.menuModeButtonHard : styles.menuModeButtonInactiveHard}`}
                onClick={() => setMode('hard')}
                whileHover={{ 
                  scale: 1.03,
                  y: -2,
                  boxShadow: mode === 'hard'
                    ? "var(--glow-error)" 
                    : "var(--glow-purple)"
                }}
                whileTap={{ scale: 0.98, y: 0 }}
              >
                <span className={styles.menuModeButtonLabel}>HARD</span>
                {mode === 'hard' && (
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

          {/* ランキングボタンとmanabyボタンを並列配置 */}
          <motion.div 
            variants={itemVariants}
            className={styles.menuSubButtons}
            style={{ position: 'relative' }}
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
              onClick={() => setManabyMenuOpen(v => !v)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* modeがsonkeigo/kenjougo/businessなら日本語表示 */}
              {mode === 'sonkeigo' ? '尊敬語' : mode === 'kenjougo' ? '謙譲語' : mode === 'business' ? 'ビジネスマナー' : 'manaby'}
            </motion.button>
            {manabyMenuOpen && (
              <div
                id="manaby-dropdown"
                className={styles.manabyDropdown}
                style={{ position: 'absolute', right: 0, top: '110%', zIndex: 100 }}
              >
                <button onClick={() => handleManabyMode('sonkeigo')}>尊敬語</button>
                <button onClick={() => handleManabyMode('kenjougo')}>謙譲語</button>
                <button onClick={() => handleManabyMode('business')}>ビジネスマナー</button>
              </div>
            )}
          </motion.div>

          {/* ショートカットヘルプ */}
          <PortalShortcut shortcuts={[
            { key: 'Space', label: 'ゲーム開始' },
            { key: 'Alt+R', label: 'ランキング' }
          ]} />
        </motion.div>
      </div>

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
    </div>
  );
};

export default MainMenu;
