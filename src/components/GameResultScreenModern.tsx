"use client";
import PortalShortcut from '@/components/PortalShortcut';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameScoreLog } from '@/types/score';
import type { PerWordScoreLog } from '@/types/score';
import { useEffect, useState } from 'react';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import styles from '@/styles/ModernGameResult.module.css';

interface GameResultScreenProps {
  resultScore: GameScoreLog['total'] | null;
  scoreLog: PerWordScoreLog[];
  onCalculateFallbackScore: () => void;
  isScoreRegistered: boolean;
  onOpenRankingModal: () => void;
  onReset: () => void;
  onGoRanking: () => void;
  onGoMenu: () => void;
}

/**
 * モダンなゲーム結果表示画面コンポーネント
 * MonkeyTypeとFinalsのUIを参考にしたデザイン
 */
export default function GameResultScreen({
  resultScore,
  scoreLog,
  onCalculateFallbackScore,
  isScoreRegistered,
  onOpenRankingModal,
  onReset,
  onGoRanking,
  onGoMenu
}: GameResultScreenProps) {
  // アニメーションのための状態
  const [showContent, setShowContent] = useState(false);

  // ショートカットのセットアップ
  useGlobalShortcuts([
    {
      key: 'r',
      handler: (e) => { e.preventDefault(); onReset(); },
    },
    {
      key: 'r',
      altKey: true,
      handler: (e) => { e.preventDefault(); onGoRanking(); },
    },
    {
      key: 'Escape',
      handler: (e) => { e.preventDefault(); onGoMenu(); },
    },
  ], [onReset, onGoRanking, onGoMenu]);

  // マウント時にアニメーションをトリガー
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // 各スタットの表示用バリアント
  const statVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.3 + (i * 0.1),
        duration: 0.6,
        ease: [0.165, 0.84, 0.44, 1]
      }
    })
  };

  // ボタン表示用バリアント
  const buttonVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.7 + (i * 0.1),
        duration: 0.5,
        ease: [0.165, 0.84, 0.44, 1]
      }
    })
  };

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.165, 0.84, 0.44, 1] }}
    >
      {/* 背景の装飾要素 */}
      <div className={styles.backgroundElements}>
        <div className={`${styles.glowElement} ${styles.glow1}`}></div>
        <div className={`${styles.glowElement} ${styles.glow2}`}></div>
      </div>
      
      {/* タイトル */}
      <motion.h2 
        className={styles.title}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        test complete
      </motion.h2>
      
      {/* メインスコア表示 */}
      <div className={styles.statsContainer}>
        <AnimatePresence>
          {resultScore ? (
            <>
              <motion.div 
                className={styles.statCard}
                custom={0}
                initial="hidden"
                animate={showContent ? "visible" : "hidden"}
                variants={statVariants}
              >
                <div className={styles.statLabel}>kpm</div>
                <div className={`${styles.statValue} ${styles.valueAmber}`}>
                  {Math.floor(resultScore.kpm)}
                </div>
              </motion.div>
              
              <motion.div 
                className={styles.statCard}
                custom={1}
                initial="hidden"
                animate={showContent ? "visible" : "hidden"}
                variants={statVariants}
              >
                <div className={styles.statLabel}>accuracy</div>
                <div className={`${styles.statValue} ${styles.valueAmber}`}>
                  {Math.floor(resultScore.accuracy)}%
                </div>
              </motion.div>
              
              <motion.div 
                className={styles.statCard}
                custom={2}
                initial="hidden"
                animate={showContent ? "visible" : "hidden"}
                variants={statVariants}
              >
                <div className={styles.statLabel}>correct</div>
                <div className={`${styles.statValue} ${styles.valueGreen}`}>
                  {resultScore.correct}
                </div>
              </motion.div>
              
              <motion.div 
                className={styles.statCard}
                custom={3}
                initial="hidden"
                animate={showContent ? "visible" : "hidden"}
                variants={statVariants}
              >
                <div className={styles.statLabel}>miss</div>
                <div className={`${styles.statValue} ${styles.valueRed}`}>
                  {resultScore.miss}
                </div>
              </motion.div>
            </>
          ) : scoreLog.length > 0 ? (
            <motion.div 
              className={styles.calculatingContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className={styles.calculatingText}>計算中...</div>
              <motion.button 
                className={styles.calculateButton}
                onClick={onCalculateFallbackScore}
                whileHover={{ y: -3, boxShadow: "0 5px 15px rgba(124, 255, 203, 0.4)" }}
                whileTap={{ y: 0 }}
              >
                スコアを表示
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              className={styles.calculatingText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              計算中...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* アクションボタン */}
      <div className={styles.buttonContainer}>
        {resultScore && !isScoreRegistered && (
          <motion.button 
            onClick={onOpenRankingModal} 
            className={`${styles.actionButton} ${styles.registerButton}`}
            custom={0}
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={buttonVariants}
            whileHover={{ y: -3, boxShadow: "0 5px 15px rgba(124, 255, 203, 0.4)" }}
            whileTap={{ y: 0 }}
          >
            ランキング登録
          </motion.button>
        )}
        
        {isScoreRegistered && (
          <motion.div 
            className={styles.registeredText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            このスコアは登録済みです
          </motion.div>
        )}
        
        <motion.button 
          onClick={onReset} 
          className={`${styles.actionButton} ${styles.retryButton}`}
          custom={1}
          initial="hidden"
          animate={showContent ? "visible" : "hidden"}
          variants={buttonVariants}
          whileHover={{ y: -3, boxShadow: "0 5px 15px rgba(124, 255, 203, 0.2)" }}
          whileTap={{ y: 0 }}
        >
          もう一度プレイ
        </motion.button>
        
        <motion.button 
          onClick={onGoRanking} 
          className={`${styles.actionButton} ${styles.rankingButton}`}
          custom={2}
          initial="hidden"
          animate={showContent ? "visible" : "hidden"}
          variants={buttonVariants}
          whileHover={{ y: -3, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
          whileTap={{ y: 0 }}
        >
          ランキングへ
        </motion.button>
        
        <motion.button 
          onClick={onGoMenu} 
          className={`${styles.actionButton} ${styles.menuButton}`}
          custom={3}
          initial="hidden"
          animate={showContent ? "visible" : "hidden"}
          variants={buttonVariants}
          whileHover={{ y: -3, opacity: 0.9 }}
          whileTap={{ y: 0 }}
        >
          メニューへ
        </motion.button>
      </div>
      
      {/* ショートカットキー表示 */}
      <PortalShortcut shortcuts={[
        { key: 'R', label: 'リトライ' },
        { key: 'Esc', label: '戻る' }
      ]} />
    </motion.div>
  );
}
