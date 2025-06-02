"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getRankingEntries, RankingEntry } from '@/lib/rankingManaby2';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import PortalShortcut from '@/components/PortalShortcut';
import NewRankingTableRow from './NewRankingTableRow';
import TabButton from './common/TabButton';
import CommonButton from './common/CommonButton';
import styles from './NewRankingScreen.bem.module.css';
import screenStyles from './common/ScreenWrapper.bem.module.css';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore';

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
      // 難易度ごとにランキングデータを取得
      const realRankingData = await getRankingEntries(15, activeDifficulty as 'normal' | 'hard');
      setRankings(realRankingData);
      setError('');
    } catch (error) {
      console.error('ランキングデータの取得に失敗しました:', error);
      setError('ランキングの取得に失敗しました');
      setRankings([]);
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
  const goBack = useSceneNavigationStore(s => s.goBack);

  useGlobalShortcuts([
    {
      key: 'Escape',
      handler: (e) => {
        e.preventDefault();
        // 直前の画面があれば戻る、なければメニューへ
        if (goBack) {
          goBack();
        } else {
          onGoMenu();
        }
      },
    },
  ], [goBack, onGoMenu]);  return (
    <div className={styles.rankingScreen}>
      <motion.div
        className={styles.rankingScreen__container}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* ヘッダー - サイバーパンク風 */}
        <motion.div variants={itemVariants} className={styles.rankingScreen__header}>
          <h1 className={styles.rankingScreen__title}>RANKING</h1>
        </motion.div>
        
        {/* 難易度選択 - monkeytype風 */}
        <motion.div variants={itemVariants} className={styles.rankingScreen__difficultySelector}>
          {['normal', 'hard'].map((difficulty) => (
            <TabButton
              key={difficulty}
              active={activeDifficulty === difficulty}
              onClick={() => handleDifficultyChange(difficulty)}
              ariaLabel={difficulty === 'normal' ? 'ノーマルモード' : 'ハードモード'}
              variant={difficulty === 'normal' ? 'primary' : 'secondary'}
              disabled={false}
            >
              {difficulty === 'normal' ? 'NORMAL' : 'HARD'}
            </TabButton>
          ))}
        </motion.div>
        
        {/* ランキングテーブル */}
        <motion.div variants={itemVariants} className={styles.rankingScreen__tableContainer}>
          {loading ? (
            <div className={styles.rankingScreen__loadingState}>
              <div className="loading-text">ランキング読み込み中</div>
              <div className={styles.rankingScreen__loadingSpinner}></div>
            </div>
          ) : error ? (
            <div className={styles.rankingScreen__errorState}>
              <div className="error-text">{error}</div>
              <CommonButton onClick={fetchRankings} variant="primary">
                リトライ
              </CommonButton>
            </div>
          ) : rankings.length === 0 ? (
            <div className={styles.rankingScreen__emptyState}>
              <h3 className="empty-title">まだスコアがありません</h3>
              <p className="empty-message">
                ゲームをプレイして最初のランキング入りを目指しましょう！
              </p>
            </div>
          ) : (
            <table className={styles.rankingScreen__table}>
              <thead className={styles.rankingScreen__tableHeader}>
                <tr>
                  <th className={styles.rankingScreen__tableHeaderCell}>順位</th>
                  <th className={styles.rankingScreen__tableHeaderCell}>プレイヤー</th>
                  <th className={styles.rankingScreen__tableHeaderCell}>KPM</th>
                  <th className={styles.rankingScreen__tableHeaderCell}>正確率</th>
                  <th className={styles.rankingScreen__tableHeaderCell}>正解</th>
                  <th className={styles.rankingScreen__tableHeaderCell}>ミス</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((entry, index) => (
                  <NewRankingTableRow entry={entry} index={index} key={index} />
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </motion.div>
      
      <PortalShortcut shortcuts={[{ key: 'Esc', label: '戻る' }]} />
    </div>
  );
};

export default NewRankingScreen;
