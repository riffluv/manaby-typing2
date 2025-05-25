'use client';

import { motion } from 'framer-motion';
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
  const averageKpm = scoreLog.length > 0 
    ? Math.round(scoreLog.reduce((sum, log) => sum + log.kpm, 0) / scoreLog.length) 
    : 0;
    
  const averageAccuracy = scoreLog.length > 0
    ? Math.round(scoreLog.reduce((sum, log) => sum + log.accuracy, 0) / scoreLog.length)
    : 0;

  // プログレス計算
  const progressPercentage = Math.min((scoreLog.length / 10) * 100, 100);
  
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className={styles.progressBarTrack}>
          <motion.div 
            className={styles.progressBar}
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
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
                KPM: <span style={{ color: averageKpm > 50 ? '#7cffcb' : 'inherit' }}>{averageKpm}</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                ACC: <span style={{ color: averageAccuracy > 90 ? '#7cffcb' : 'inherit' }}>{averageAccuracy}%</span>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
