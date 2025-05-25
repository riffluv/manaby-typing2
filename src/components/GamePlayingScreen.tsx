'use client';

import { motion } from 'framer-motion';
import GameScreen from '@/components/GameScreen';
import { TypingWord, KanaDisplay } from '@/types/typing';
import { PerWordScoreLog } from '@/types/score';
import styles from '@/styles/GamePlayingScreen.module.css';
import MinimalShortcut from '@/components/MinimalShortcut';

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
}: GamePlayingScreenProps) {
  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ミニマルなEscキーショートカット表示（全画面共通化のため削除） */}
      {/* ゲーム画面 */}
      <GameScreen 
        currentWord={currentWord}
        currentKanaIndex={currentKanaIndex}
        currentKanaDisplay={kanaDisplay}
      />

      {/* プログレスバーとステータス */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBarTrack}>
          <motion.div 
            className={styles.progressBar}
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min((scoreLog.length / 10) * 100, 100)}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div className={styles.statusText}>
          <div>WORDS: {scoreLog.length}</div>
          {scoreLog.length > 0 && (
            <>
              <div>KPM: {Math.round(scoreLog.reduce((sum, log) => sum + log.kpm, 0) / scoreLog.length)}</div>
              <div>ACC: {Math.round(scoreLog.reduce((sum, log) => sum + log.accuracy, 0) / scoreLog.length)}%</div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
