"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getRankingEntries, RankingEntry } from '@/lib/rankingManaby2';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import PortalShortcut from '@/components/PortalShortcut';
import styles from '@/styles/ModernRanking.module.css';

interface NewRankingScreenProps {
  onGoMenu: () => void;
}

const NewRankingScreen: React.FC<NewRankingScreenProps> = ({ onGoMenu }) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDifficulty, setActiveDifficulty] = useState<string>('normal');

  // アニメーション設定
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    },
  };  // ランキングデータを取得する（実際のデータ使用）
  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      // 実際のランキングデータを取得
      const realRankingData = await getRankingEntries();
      
      // 全てのデータを表示（難易度フィルタリングは現在未対応）
      // 注意: RankingEntry型にmodeプロパティがないため、全データを表示
      const displayData = realRankingData.slice(0, 15); // 表示数を15件に制限
      
      setRankings(displayData);
      setError(''); // エラーをクリア
    } catch (error) {
      console.error('ランキングデータの取得に失敗しました:', error);
      setError('ランキングの取得に失敗しました');
      setRankings([]); // エラー時は空配列を設定
    } finally {
      setLoading(false);
    }
  }, [activeDifficulty]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // 難易度変更ハンドラ
  const handleDifficultyChange = (difficulty: string) => {
    if (difficulty === activeDifficulty) return;
    setActiveDifficulty(difficulty);
  };
  useGlobalShortcuts([
    {
      key: 'Escape',
      handler: (e) => { e.preventDefault(); onGoMenu(); },
    },
  ], [onGoMenu]);
  return (
    <div className={styles.container}>
      {/* 背景エフェクト */}
      <div className={styles.backgroundElements}></div>
      <motion.div
        className={styles.content}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* ヘッダー */}
        <motion.div variants={itemVariants} className={styles.header}>
          <h1 className={styles.title}>ranking</h1>
          <p className={styles.subtitle}>MonkeyType + Finals inspired</p>
        </motion.div>
        
        {/* 難易度選択 */}
        <motion.div variants={itemVariants} className={styles.difficultySelector}>
          {['easy', 'normal', 'hard'].map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => handleDifficultyChange(difficulty)}
              className={`${styles.difficultyButton} ${
                activeDifficulty === difficulty ? styles.difficultyButtonActive : ''
              }`}
            >
              {difficulty === 'easy' ? 'やさしい' : 
               difficulty === 'normal' ? 'ふつう' : 'むずかしい'}
            </button>
          ))}
        </motion.div>
        
        {/* ランキングテーブル */}
        <motion.div variants={itemVariants} className={styles.rankingContainer}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingText}>ランキング読み込み中</div>
              <div className={styles.loadingSpinner}></div>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <div className={styles.errorText}>{error}</div>
              <button 
                onClick={fetchRankings}
                className={styles.retryButton}
              >
                リトライ
              </button>
            </div>
          ) : rankings.length === 0 ? (
            <div className={styles.emptyContainer}>
              <h3 className={styles.emptyTitle}>まだスコアがありません</h3>
              <p className={styles.emptyMessage}>
                ゲームをプレイして最初のランキング入りを目指しましょう！
              </p>
            </div>
          ) : (            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>順位</th>
                  <th className={styles.tableHeaderCell}>プレイヤー</th>
                  <th className={styles.tableHeaderCell}>KPM</th>
                  <th className={styles.tableHeaderCell}>正確率</th>
                  <th className={styles.tableHeaderCell}>正解</th>
                  <th className={styles.tableHeaderCell}>ミス</th>
                </tr>
              </thead>
              <tbody>{rankings.map((entry, index) => (
                  <motion.tr 
                    key={index}
                    className={`
                      ${styles.tableRow} 
                      ${styles.fadeIn}
                      ${index < 3 ? styles.tableRowTop3 : ''}
                      ${index === 0 ? styles.tableRowFirst : ''}
                      ${index === 1 ? styles.tableRowSecond : ''}
                      ${index === 2 ? styles.tableRowThird : ''}
                    `}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <td className={`${styles.tableCell} ${styles.rankCell} ${
                      index === 0 ? styles.rankCellFirst :
                      index === 1 ? styles.rankCellSecond :
                      index === 2 ? styles.rankCellThird : ''
                    }`}>
                      {index === 0 ? '🏆 1st' :
                       index === 1 ? '🥈 2nd' :
                       index === 2 ? '🥉 3rd' :
                       `${index + 1}`}
                    </td>
                    <td className={`${styles.tableCell} ${styles.nameCell}`}>
                      {entry.name}
                    </td>
                    <td className={`${styles.tableCell} ${styles.kpmCell}`}>
                      {entry.kpm}
                    </td>
                    <td className={`${styles.tableCell} ${styles.accuracyCell}`}>
                      {entry.accuracy}%
                    </td>
                    <td className={`${styles.tableCell} ${styles.correctCell}`}>
                      {entry.correct}
                    </td>
                    <td className={`${styles.tableCell} ${styles.missCell}`}>
                      {entry.miss}
                    </td>
                  </motion.tr>
                ))}</tbody>
            </table>
          )}
        </motion.div>
      </motion.div>
      
      <PortalShortcut shortcuts={[{ key: 'Esc', label: '戻る' }]} />
    </div>
  );
};

export default NewRankingScreen;
