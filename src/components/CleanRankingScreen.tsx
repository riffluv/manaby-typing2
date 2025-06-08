"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { getRankingEntries, RankingEntry } from '@/lib/rankingManaby2';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore';
import styles from '@/styles/components/RankingScreen.module.css';

interface CleanRankingScreenProps {
  onGoMenu: () => void;
}

/**
 * ランキング画面 - ranking.htmlのデザインを完全に再現
 * React最適化版: React.memo + useCallback最適化
 */
const CleanRankingScreen: React.FC<CleanRankingScreenProps> = React.memo(({ onGoMenu }) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 履歴ベースのナビゲーションストアから goBack を取得
  const goBack = useSceneNavigationStore((state) => state.goBack);

  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(0); // 0ベースのページングに変更
  const perPage = 6; // 1ページあたりの表示件数
  
  // ランキングデータを取得
  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      const realRankingData = await getRankingEntries(100, 'normal');
      setRankings(realRankingData);
      setError('');
    } catch (error) {
      console.error('Failed to fetch ranking data:', error);
      setError('Failed to fetch rankings');
      setRankings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // メニューに戻る処理をメモ化
  const handleGoMenu = useCallback(() => {
    onGoMenu();
  }, [onGoMenu]);
  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);
  
  // ページネーション用のデータ計算（0ベース）
  const totalPages = Math.ceil(rankings.length / perPage);
  const startIndex = currentPage * perPage;
  const endIndex = Math.min(startIndex + perPage, rankings.length);
  const currentPageData = rankings.slice(startIndex, endIndex);
  // ページ変更ハンドラ（Prev/Next）をメモ化
  const changePage = useCallback((direction: number) => {
    const maxPage = Math.max(0, totalPages - 1);
    setCurrentPage(Math.max(0, Math.min(maxPage, currentPage + direction)));
  }, [totalPages, currentPage]);

  // 前のページハンドラーをメモ化
  const handlePrevPage = useCallback(() => changePage(-1), [changePage]);
  // 次のページハンドラーをメモ化
  const handleNextPage = useCallback(() => changePage(1), [changePage]);
  // 履歴ベースのナビゲーション処理をメモ化
  const handleGoBack = useCallback(() => {
    goBack();
  }, [goBack]);
  // ショートカットキー
  // ESC: 履歴に基づいて前の画面に戻る (Result → Ranking なら Result に、Menu → Ranking なら Menu に戻る)
  useGlobalShortcuts([
    {
      key: 'Escape',
      handler: (e) => {
        e.preventDefault();
        handleGoBack();
      },
    },
  ], [handleGoBack]);return (
    <div className={styles.ranking}>
      <div className={styles.ranking__container}>
        <h1 className={styles.ranking__title}>Ranking</h1>
        
        {loading ? (
          <div>Loading rankings...</div>
        ) : error ? (
          <div>
            <div>{error}</div>
            <button onClick={fetchRankings}>Retry</button>
          </div>
        ) : rankings.length === 0 ? (
          <div>
            <h3>No scores yet</h3>
            <p>Play the game and aim for your first ranking entry!</p>
          </div>
        ) : (
          <>
            <table className={styles.ranking__table}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>KPM</th>
                  <th>Accuracy</th>
                  <th>Misses</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>{currentPageData.map((entry, index) => (<tr key={index}><td>{startIndex + index + 1}</td><td>{entry.name}</td><td>{entry.kpm.toFixed(1)}</td><td>{entry.accuracy.toFixed(1)}%</td><td>{entry.miss}</td><td>{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '-'}</td></tr>))}</tbody>
            </table>            <div className={styles.ranking__pagination}>
              <button className={styles.ranking__pageBtn} onClick={handlePrevPage}>Prev</button>
              <button className={styles.ranking__pageBtn} onClick={handleNextPage}>Next</button>
            </div><div className={styles.ranking__buttons}>
              <button className={styles.button} onClick={handleGoMenu}>Back</button>
              <button className={styles.button} onClick={handleGoMenu}>Main Menu</button>
            </div>
          </>
        )}
      </div>
    </div>  );
});

CleanRankingScreen.displayName = 'CleanRankingScreen';

export default CleanRankingScreen;
