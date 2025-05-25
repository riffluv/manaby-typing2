"use client";
import PortalShortcut from '@/components/PortalShortcut';
import MinimalShortcut from '@/components/MinimalShortcut';

import { motion } from 'framer-motion';
import type { GameScoreLog } from '@/types/score';
import type { PerWordScoreLog } from '@/types/score';
import { useEffect } from 'react';

import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import styles from '@/styles/GameResultScreen.module.css';

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
 * ゲーム結果表示画面コンポーネント
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

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* リザルト画面 */}
      <h2 className={styles.title}>test complete</h2>
      <div className={styles.resultGrid}>
        {resultScore ? (
          <>
            <div>
              <div className={styles.label}>kpm</div>
              <div className={styles.valueAmber}>{Math.floor(resultScore.kpm)}</div>
            </div>
            <div>
              <div className={styles.label}>accuracy</div>
              <div className={styles.valueAmber}>{Math.floor(resultScore.accuracy)}%</div>
            </div>
            <div>
              <div className={styles.label}>correct</div>
              <div className={styles.valueGreen}>{resultScore.correct}</div>
            </div>
            <div>
              <div className={styles.label}>miss</div>
              <div className={styles.valueRed}>{resultScore.miss}</div>
            </div>
          </>
        ) : scoreLog.length > 0 ? (
          <div className={styles.calculatingContainer}>
            <div className={styles.calculatingText}>計算中...</div>
            <button 
              className={styles.calculateButton}
              onClick={onCalculateFallbackScore}
            >
              スコアを表示
            </button>
          </div>
        ) : (
          <div className={styles.calculatingText}>計算中...</div>
        )}
      </div>
      
      <div className={styles.buttonContainer}>
        {/* ランキング登録ボタン */}
        {resultScore && !isScoreRegistered && (
          <button 
            onClick={onOpenRankingModal} 
            className={styles.registerButton}
          >
            ランキング登録
          </button>
        )}
        {isScoreRegistered && (
          <div className={styles.registeredText}>このスコアは登録済みです</div>
        )}
        <button 
          onClick={onReset} 
          className={styles.retryButton}
        >
          もう一度プレイ
        </button>
        <button 
          onClick={onGoRanking} 
          className={styles.rankingButton}
        >
          ランキングへ
        </button>
        <button 
          onClick={onGoMenu} 
          className={styles.menuButton}
        >
          メニューへ
        </button>
      </div>
      
      {/* 背景 */}
      <div className={styles.background}></div>
      {/* <ShortcutFooter shortcuts={shortcuts} /> */}
      <PortalShortcut shortcuts={[
        { key: 'R', label: 'リトライ' },
        { key: 'Esc', label: '戻る' }
      ]} />
    </motion.div>
  );
}
