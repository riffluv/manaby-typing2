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
import OptimizedAudioSystem from '@/utils/OptimizedAudioSystem';

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
  const questionCount = useQuestionCount();  // 管理者モード状態
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminInput, setAdminInput] = useState(questionCount);
  const [adminStatus, setAdminStatus] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  // モード選択モーダル状態
  const [modeSelectOpen, setModeSelectOpen] = useState(false);
  // ゲーム開始ハンドラー
  const handleStart = async () => {
    OptimizedAudioSystem.init();
    await OptimizedAudioSystem.resumeAudioContext();
    resetGame();
    setGameStatus('playing');
    onStart();
  };
  // モード選択ハンドラー
  const handleModeSelect = (newMode: 'normal' | 'hard' | 'sonkeigo' | 'kenjougo' | 'business') => {
    setMode(newMode);
    setModeSelectOpen(false);
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
        if (adminOpen || modeSelectOpen) return; // モーダルが開いているときは無効化
        e.preventDefault();
        await handleStart();
      },
    },
    {
      key: 'r',
      altKey: true,
      handler: (e) => { if (!adminOpen && !modeSelectOpen) { e.preventDefault(); onRanking(); } },
    },
    {
      key: 'Escape',
      handler: (e) => {
        if (modeSelectOpen) {
          e.preventDefault();
          setModeSelectOpen(false);
        }
      },
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
  ], [handleStart, onRanking, adminOpen, modeSelectOpen]);
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

  return (
    <div className={screenStyles.screenWrapper}>
      {/* モード選択モーダル */}
      {modeSelectOpen && (
        <div className={styles.modeSelectOverlay} onClick={() => setModeSelectOpen(false)}>
          <motion.div 
            className={styles.modeSelectModal}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className={styles.modeSelectTitle}>SELECT MODE</h2>
            
            <div className={styles.modeGrid}>
              <motion.button
                className={`${styles.modeButton} ${mode === 'normal' ? styles.modeButtonActive : ''}`}
                onClick={() => handleModeSelect('normal')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={styles.modeButtonContent}>
                  <span className={styles.modeButtonTitle}>NORMAL</span>
                  <span className={styles.modeButtonDesc}>標準タイピング練習</span>
                </div>
              </motion.button>

              <motion.button
                className={`${styles.modeButton} ${mode === 'hard' ? styles.modeButtonActive : ''}`}
                onClick={() => handleModeSelect('hard')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={styles.modeButtonContent}>
                  <span className={styles.modeButtonTitle}>HARD</span>
                  <span className={styles.modeButtonDesc}>高難易度タイピング</span>
                </div>
              </motion.button>

              <motion.button
                className={`${styles.modeButton} ${mode === 'sonkeigo' ? styles.modeButtonActive : ''}`}
                onClick={() => handleModeSelect('sonkeigo')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={styles.modeButtonContent}>
                  <span className={styles.modeButtonTitle}>尊敬語</span>
                  <span className={styles.modeButtonDesc}>相手を高める言葉遣い</span>
                </div>
              </motion.button>

              <motion.button
                className={`${styles.modeButton} ${mode === 'kenjougo' ? styles.modeButtonActive : ''}`}
                onClick={() => handleModeSelect('kenjougo')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={styles.modeButtonContent}>
                  <span className={styles.modeButtonTitle}>謙譲語</span>
                  <span className={styles.modeButtonDesc}>自分を下げる丁寧な表現</span>
                </div>
              </motion.button>

              <motion.button
                className={`${styles.modeButton} ${mode === 'business' ? styles.modeButtonActive : ''}`}
                onClick={() => handleModeSelect('business')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={styles.modeButtonContent}>
                  <span className={styles.modeButtonTitle}>ビジネスマナー</span>
                  <span className={styles.modeButtonDesc}>ビジネスシーンでの言葉選び</span>
                </div>
              </motion.button>
            </div>

            <motion.button
              className={styles.modeSelectCloseButton}
              onClick={() => setModeSelectOpen(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              戻る
            </motion.button>
          </motion.div>
        </div>
      )}

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
      </CommonModal>      <div className={styles.mainMenuContainer}>
        {/* ゲームロゴ/タイトル */}
        <div className={styles.mainMenuHeader}>
          <h1 className={styles.mainMenuTitle}>
            TYPING GAME
          </h1>
          <p className={styles.menuTitleSub}>
            PRACTICE MODE
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
          </motion.div>          {/* 現在のモード表示 */}
          <motion.div 
            variants={itemVariants}
            className={styles.currentModeDisplay}
          >
            <span className={styles.currentModeLabel}>Current Mode:</span>
            <span className={styles.currentModeValue}>
              {mode === 'normal' ? 'NORMAL' :
               mode === 'hard' ? 'HARD' :
               mode === 'sonkeigo' ? '尊敬語' :
               mode === 'kenjougo' ? '謙譲語' :
               mode === 'business' ? 'ビジネスマナー' : 'NORMAL'}
            </span>
          </motion.div>          {/* メインボタンセクション */}
          <motion.div 
            variants={itemVariants}
            className={styles.menuSubButtons}
          >
            <motion.button
              className={`btn-secondary ${styles.menuSubButton}`}
              onClick={() => setModeSelectOpen(true)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              SELECT MODE
            </motion.button>
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
              onClick={() => {/* TODO: システム設定画面を実装 */}}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              SYSTEM
            </motion.button>
          </motion.div>

          {/* ショートカットヘルプ */}
          <PortalShortcut shortcuts={[
            { key: 'Space', label: 'ゲーム開始' },
            { key: 'Alt+R', label: 'ランキング' }
          ]} />
        </motion.div>
      </div>      {/* バージョン情報 - 控えめに */}
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
          v2.0.0
        </motion.span>
      </motion.div>
    </div>
  );
};

export default MainMenu;
