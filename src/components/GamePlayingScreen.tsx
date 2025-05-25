'use client';

import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import GameScreen from '@/components/GameScreen';
import { TypingWord, KanaDisplay } from '@/types/typing';
import { PerWordScoreLog } from '@/types/score';
import styles from '@/styles/GamePlayingScreen.module.css';
import PortalShortcut from '@/components/PortalShortcut';

interface GamePlayingScreenProps {
  currentWord: TypingWord;
  currentKanaIndex: number;
  kanaDisplay: KanaDisplay;
  scoreLog: PerWordScoreLog[];
}

/**
 * タイピングゲームのプレイ画面コンポーネント
 */
export default function GamePlayingScreen({
  currentWord,
  currentKanaIndex,
  kanaDisplay,
  scoreLog
}: GamePlayingScreenProps) {  // スコア計算ロジック
  // 直近のお題のKPMと正確率
  const latestKpm = scoreLog.length > 0 ? Math.round(scoreLog[scoreLog.length - 1].kpm) : 0;
  const latestAccuracy = scoreLog.length > 0 ? Math.round(scoreLog[scoreLog.length - 1].accuracy) : 0;

  // プログレス計算
  const progressPercentage = Math.min((scoreLog.length / 10) * 100, 100);

  // 初回表示時はアニメーションなし
  const [hasStarted, setHasStarted] = useState(false);
  // scoreLog.lengthが1以上になったらアニメーションを有効化
  useEffect(() => {
    if (scoreLog.length > 0 && !hasStarted) {
      setHasStarted(true);
    }
    if (scoreLog.length === 0 && hasStarted) {
      setHasStarted(false);
    }
  }, [scoreLog.length, hasStarted]);

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.165, 0.84, 0.44, 1] }}
    >
      {/* ゲーム画面はEscのみ */}
      <PortalShortcut shortcuts={[{ key: 'Esc', label: '戻る' }]} />
      
      {/* ゲーム画面 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <GameScreen 
          currentWord={currentWord}
          currentKanaIndex={currentKanaIndex}
          currentKanaDisplay={kanaDisplay}
        />
      </motion.div>

      {/* プログレスバーとステータス */}
      <motion.div 
        className={styles.progressContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className={styles.progressBarTrack}>
          <motion.div 
            className={styles.progressBar}
            style={{ width: !hasStarted ? `${progressPercentage}%` : undefined }}
            animate={hasStarted ? { width: `${progressPercentage}%` } : false}
            transition={hasStarted ? { duration: 0.3, ease: "easeOut" } : {}}
          />
        </div>
        <div className={styles.statusText}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            WORDS: {scoreLog.length}/10
          </motion.div>
          
          {scoreLog.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                KPM: <span style={{ color: latestKpm > 50 ? '#7cffcb' : 'inherit' }}>{latestKpm}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                ACC: <span style={{ color: latestAccuracy > 90 ? '#7cffcb' : 'inherit' }}>{latestAccuracy}%</span>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
