"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getRankingEntries, RankingEntry } from '@/lib/rankingManaby2';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import PortalShortcut from '@/components/PortalShortcut';
import NewRankingTableRow from './NewRankingTableRow';

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
  useGlobalShortcuts([
    {
      key: 'Escape',
      handler: (e) => { e.preventDefault(); onGoMenu(); },
    },
  ], [onGoMenu]);  return (
    <main className="ranking-screen">
      <motion.div
        className="ranking-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* ヘッダー - サイバーパンク風 */}
        <motion.div variants={itemVariants} className="ranking-header">
          <h1 className="ranking-title">RANKING</h1>
        </motion.div>
        
        {/* 難易度選択 - monkeytype風 */}
        <motion.div variants={itemVariants} className="difficulty-selector">
          {['normal', 'hard'].map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => handleDifficultyChange(difficulty)}
              className={`btn-secondary ${
                activeDifficulty === difficulty ? 'btn-active' : ''
              }`}
            >
              {difficulty === 'normal' ? 'NORMAL' : 'HARD'}
            </button>
          ))}
        </motion.div>
        
        {/* ランキングテーブル */}
        <motion.div variants={itemVariants} className="ranking-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-text">ランキング読み込み中</div>
              <div className="loading-spinner"></div>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-text">{error}</div>
              <button 
                onClick={fetchRankings}
                className="btn-primary"
              >
                リトライ
              </button>
            </div>
          ) : rankings.length === 0 ? (
            <div className="empty-state">
              <h3 className="empty-title">まだスコアがありません</h3>
              <p className="empty-message">
                ゲームをプレイして最初のランキング入りを目指しましょう！
              </p>
            </div>
          ) : (
            <table className="ranking-table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">順位</th>
                  <th className="table-header-cell">プレイヤー</th>
                  <th className="table-header-cell">KPM</th>
                  <th className="table-header-cell">正確率</th>
                  <th className="table-header-cell">正解</th>
                  <th className="table-header-cell">ミス</th>
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
    </main>
  );
};

export default NewRankingScreen;
