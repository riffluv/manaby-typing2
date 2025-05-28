"use client";
import PortalShortcut from '@/components/PortalShortcut';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameScoreLog } from '@/types/score';
import type { PerWordScoreLog } from '@/types/score';
import { useEffect, useState, useRef } from 'react';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import GameResultStat from './GameResultStat';
import styles from './GameResultScreen.module.css';
import screenStyles from './common/ScreenWrapper.module.css';

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
 * ゲームリザルト画面コンポーネント
 * @returns {JSX.Element}
 */

/**
 * モダンなゲーム結果表示画面コンポーネント
 * monkeytype × THE FINALS のサイバーパンク美学を融合
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
  
  // カウントアップアニメーション用の状態
  const [kpmCount, setKpmCount] = useState(0);
  const [accuracyCount, setAccuracyCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  
  // アニメーションの実行状態を管理
  const animationCompleted = useRef(false);
  
  // パフォーマンスメッセージを決定する関数
  const getPerformanceMessage = () => {
    if (!resultScore) return { message: "", level: "" };
    
    const { kpm, accuracy } = resultScore;
    
    if (kpm > 300 && accuracy > 98) {
      return {
        message: "伝説級タイピング！神の領域です！",
        level: "legendary"
      };
    } else if (kpm > 250 && accuracy > 95) {
      return {
        message: "プロ級の素晴らしいタイピングです！",
        level: "amazing"
      };
    } else if (kpm > 200 && accuracy > 90) {
      return {
        message: "素晴らしい速度と精度です！",
        level: "excellent"
      };
    } else if (kpm > 150 && accuracy > 85) {
      return {
        message: "とても良いパフォーマンスです！",
        level: "great"
      };
    } else if (kpm > 100) {
      return {
        message: "良いペースですね！",
        level: "good"
      };
    } else {
      return {
        message: "次は自己ベストを目指しましょう！",
        level: "normal"
      };
    }
  };
  
  // パフォーマンスメッセージの取得
  const perfMessage = getPerformanceMessage();

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
  
  // スコアカウントアップアニメーション
  useEffect(() => {
    if (showContent && resultScore && !animationCompleted.current) {
      animationCompleted.current = true;
      
      const targetKpm = Math.floor(resultScore.kpm);
      const targetAccuracy = Math.floor(resultScore.accuracy);
      const targetCorrect = resultScore.correct;
      const targetMiss = resultScore.miss;
        // アニメーション時間（ミリ秒）- 短くして高速に
      const animationDuration = 1000;
      const framesPerSecond = 60;
      const totalFrames = animationDuration / (1000 / framesPerSecond);
      
      let frame = 0;
      
      const animate = () => {
        if (frame <= totalFrames) {
          const progress = frame / totalFrames;
          const easedProgress = 1 - Math.pow(1 - progress, 3); // イージング関数（cubic-out）
          
          setKpmCount(Math.floor(targetKpm * easedProgress));
          setAccuracyCount(Math.floor(targetAccuracy * easedProgress));
          setCorrectCount(Math.floor(targetCorrect * easedProgress));
          setMissCount(Math.floor(targetMiss * easedProgress));
          
          frame++;
          requestAnimationFrame(animate);
        } else {
          // 最終値で確実に終了
          setKpmCount(targetKpm);
          setAccuracyCount(targetAccuracy);
          setCorrectCount(targetCorrect);
          setMissCount(targetMiss);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [showContent, resultScore]);

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
    <div className={screenStyles.screenWrapper}>
      <div className={styles.resultContainer}>
        <div className={styles.resultHeader}>
          <h1 className={styles.resultTitle}>RESULT</h1>
        </div>
        {/* メインスコア表示 - グリッドレイアウト */}
        <div className="stats-grid">
          <AnimatePresence>
            {resultScore ? (
              <>
                <GameResultStat 
                  label="kpm" 
                  value={kpmCount} 
                  valueClass="stat-value-primary" 
                  custom={0} 
                  showContent={showContent} 
                  statVariants={statVariants} 
                />
                <GameResultStat 
                  label="accuracy" 
                  value={accuracyCount} 
                  valueClass="stat-value-primary" 
                  custom={1} 
                  showContent={showContent} 
                  statVariants={statVariants} 
                />
                <GameResultStat 
                  label="correct" 
                  value={correctCount} 
                  valueClass="stat-value-success" 
                  custom={2} 
                  showContent={showContent} 
                  statVariants={statVariants} 
                />
                <GameResultStat 
                  label="miss" 
                  value={missCount} 
                  valueClass="stat-value-error" 
                  custom={3} 
                  showContent={showContent} 
                  statVariants={statVariants} 
                />
              </>
            ) : scoreLog.length > 0 ? (
              <motion.div 
                className="calculating-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="calculating-text">計算中...</div>
                <motion.button 
                  className="btn-primary"
                  onClick={onCalculateFallbackScore}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ y: 0, scale: 0.98 }}
                >
                  スコアを表示
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                className="calculating-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                計算中...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* パフォーマンスメッセージ */}
        {resultScore && (
          <motion.div 
            className="performance-message"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
          >
            <span className="message-highlight">{perfMessage.message}</span>
          </motion.div>
        )}
        
        {/* アクションボタン */}
        <div className="result-actions">
          {resultScore && !isScoreRegistered && (
            <motion.button 
              onClick={onOpenRankingModal} 
              className="btn-primary"
              custom={0}
              initial="hidden"
              animate={showContent ? "visible" : "hidden"}
              variants={buttonVariants}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ y: 0, scale: 0.98 }}
            >
              ランキング登録
            </motion.button>
          )}
          
          {isScoreRegistered && (
            <motion.div 
              className="registered-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              このスコアは登録済みです
            </motion.div>
          )}
          
          <motion.button 
            onClick={onReset} 
            className="btn-secondary"
            custom={1}
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={buttonVariants}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ y: 0, scale: 0.98 }}
          >
            もう一度プレイ
          </motion.button>
          
          <motion.button 
            onClick={onGoRanking} 
            className="btn-secondary"
            custom={2}
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={buttonVariants}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ y: 0, scale: 0.98 }}
          >
            ランキングへ
          </motion.button>
          
          <motion.button 
            onClick={onGoMenu} 
            className="btn-secondary"
            custom={3}
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={buttonVariants}
            whileHover={{ y: -3, scale: 1.02, opacity: 0.9 }}
            whileTap={{ y: 0, scale: 0.98 }}
          >
            メニューへ
          </motion.button>
        </div>
      </div>
      
      {/* ショートカットキー表示 */}
      <PortalShortcut shortcuts={[
        { key: 'R', label: 'リトライ' },
        { key: 'Alt+R', label: 'ランキング' },
        { key: 'Esc', label: 'メニュー' }
      ]} />
    </div>
  );
}
