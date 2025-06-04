import React from 'react';
import { TypingWord, GameScoreLog, PerWordScoreLog } from '@/types';
import SimpleGameScreen from './SimpleGameScreen';
import styles from '@/styles/components/StandaloneTypingGameScreen.module.css';

export interface StandaloneTypingGameScreenProps {
  gameState: 'ready' | 'playing' | 'finished';
  currentWord: TypingWord;
  completedCount: number;
  questionCount: number;
  finalScore: GameScoreLog['total'] | null;
  scoreLog: PerWordScoreLog[];
  onWordComplete: (scoreLog: PerWordScoreLog) => void;
  onStartGame: () => void;
  onRestart: () => void;
  onGoMenu?: () => void;
  onGoRanking?: () => void;
}

/**
 * StandaloneTypingGameScreen - UI描画専用
 * 状態・進行はpropsで受け取り、描画のみ担当
 */
const StandaloneTypingGameScreen: React.FC<StandaloneTypingGameScreenProps> = ({
  gameState,
  currentWord,
  completedCount,
  questionCount,
  finalScore,
  scoreLog,
  onWordComplete,
  onStartGame,
  onRestart,
  onGoMenu,
  onGoRanking,
}) => {  if (gameState === 'ready') {
    return (
      <div className={styles.standaloneGame}>
        <h1 className={styles.standaloneGame__title}>タイピングゲーム</h1>
        <p className={styles.standaloneGame__description}>{questionCount}問のタイピング問題にチャレンジしよう！</p>
        <button onClick={onStartGame} className={styles.standaloneGame__button}>ゲーム開始</button>
        {onGoMenu && (
          <button onClick={onGoMenu} className={`${styles.standaloneGame__button} ${styles['standaloneGame__button--secondary']}`}>メニューに戻る</button>
        )}
      </div>
    );
  }

  if (gameState === 'finished') {
    return (      <div className={styles.standaloneGame}>
        <h1 className={styles.standaloneGame__title}>ゲーム完了！</h1>
        {finalScore && (
          <div className={styles.standaloneGame__results}>
            <div className={styles.standaloneGame__resultItem}>
              <div className={styles.standaloneGame__resultLabel}>KPM</div>
              <div className={styles.standaloneGame__resultValue}>{Math.floor(finalScore.kpm)}</div>
            </div>
            <div className={styles.standaloneGame__resultItem}>
              <div className={styles.standaloneGame__resultLabel}>精度</div>
              <div className={styles.standaloneGame__resultValue}>{Math.floor(finalScore.accuracy * 100)}%</div>
            </div>
            <div className={styles.standaloneGame__resultItem}>
              <div className={styles.standaloneGame__resultLabel}>正解</div>
              <div className={styles.standaloneGame__resultValue}>{finalScore.correct}</div>
            </div>
            <div className={styles.standaloneGame__resultItem}>
              <div className={styles.standaloneGame__resultLabel}>ミス</div>
              <div className={styles.standaloneGame__resultValue}>{finalScore.miss}</div>
            </div>
          </div>
        )}        <div className={styles.standaloneGame__buttonGroup}>
          <button onClick={onRestart} className={styles.standaloneGame__button}>もう一度</button>
          {onGoRanking && (
            <button onClick={onGoRanking} className={`${styles.standaloneGame__button} ${styles['standaloneGame__button--success']}`}>ランキング</button>
          )}
          {onGoMenu && (
            <button onClick={onGoMenu} className={`${styles.standaloneGame__button} ${styles['standaloneGame__button--secondary']}`}>メニュー</button>
          )}
        </div>
      </div>
    );
  }  if (gameState === 'playing' && currentWord.japanese) {
    return (      <div className={styles.standaloneGame__gameContainer}>
        <SimpleGameScreen 
          currentWord={currentWord} 
          onWordComplete={onWordComplete}
        />
      </div>
    );
  }
  return (
    <div className={styles.standaloneGame__loading}>ゲームを準備中...</div>
  );
};

export default StandaloneTypingGameScreen;
