"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { getRankingEntries, RankingEntry } from '@/lib/rankingManaby2';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import styles from '@/styles/components/RankingScreen.module.css';

interface CleanRankingScreenProps {
  onGoMenu: () => void;
}

/**
 * ランキング画面 - ranking.htmlのデザインを完全に再現
 */
const CleanRankingScreen: React.FC<CleanRankingScreenProps> = ({ onGoMenu }) => {
  const { setLastScore } = useSceneNavigationStore();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDifficulty, setActiveDifficulty] = useState<string>('normal');
  
  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6; // 1ページあたりの表示件数
  
  // ランキングデータを取得
  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      // より多くのデータを取得（ページネーション対応）
      const realRankingData = await getRankingEntries(100, activeDifficulty as 'normal' | 'hard');
      setRankings(realRankingData);
      setError('');
      // 難易度変更時は1ページ目に戻る
      setCurrentPage(1);
    } catch (error) {
      console.error('ランキングデータの取得に失敗しました:', error);
      setError('ランキングの取得に失敗しました');
      setRankings([]);
    } finally {
      setLoading(false);
    }
  }, [activeDifficulty]);

  // メニューに戻る処理をメモ化
  const handleGoMenu = useCallback(() => {
    onGoMenu();
  }, [onGoMenu]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);
  
  // 難易度変更ハンドラ
  const handleDifficultyChange = (difficulty: string) => {
    if (difficulty === activeDifficulty) return;
    setActiveDifficulty(difficulty);
  };

  // ページネーション用のデータ計算
  const totalPages = Math.ceil(rankings.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentPageData = rankings.slice(startIndex, endIndex);

  // ページ変更ハンドラ
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ショートカットキー
  useGlobalShortcuts([
    {
      key: 'Escape',
      handler: (e) => {
        e.preventDefault();
        handleGoMenu();
      },
    },
  ], [handleGoMenu]);

  return (
    <div className={styles.rankingScreen}>
      {/* Ranking Section */}
      <section className={styles.rankingScreen__section}>
        {/* Title */}
        <h1 className={styles.rankingScreen__title}>
          RANKING
        </h1>

        {/* Tabs */}
        <div className={styles.rankingScreen__tabs}>
          {['normal', 'hard'].map((difficulty) => (
            <div
              key={difficulty}
              onClick={() => handleDifficultyChange(difficulty)}
              className={`${styles.rankingScreen__tab} ${
                activeDifficulty === difficulty ? styles['rankingScreen__tab--active'] : ''
              }`}
            >
              {difficulty === 'normal' ? 'Normal' : 'Hard'}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className={styles.rankingScreen__content}>
          {loading ? (
            <div className={styles.rankingScreen__state}>
              <div>ランキング読み込み中...</div>
            </div>
          ) : error ? (
            <div className={`${styles.rankingScreen__state} ${styles['rankingScreen__state--error']}`}>
              <div>{error}</div>
              <button
                onClick={fetchRankings}
                className={styles.rankingScreen__retryButton}
              >
                リトライ
              </button>
            </div>
          ) : rankings.length === 0 ? (
            <div className={styles.rankingScreen__state}>
              <h3 className={styles.rankingScreen__state__title}>まだスコアがありません</h3>
              <p className={styles.rankingScreen__state__text}>
                ゲームをプレイして最初のランキング入りを目指しましょう！
              </p>
            </div>
          ) : (
            <div className={styles.rankingScreen__tableContainer}>
              <table className={styles.rankingScreen__table}>
                <thead className={styles.rankingScreen__tableHead}>
                  <tr className={styles.rankingScreen__tableRow}>
                    <th className={styles.rankingScreen__tableHeader}>順位</th>
                    <th className={styles.rankingScreen__tableHeader}>プレイヤー</th>
                    <th className={styles.rankingScreen__tableHeader}>KPM</th>
                    <th className={styles.rankingScreen__tableHeader}>正確率</th>
                    <th className={styles.rankingScreen__tableHeader}>正解</th>
                    <th className={styles.rankingScreen__tableHeader}>ミス</th>
                  </tr>
                </thead>
                <tbody className={styles.rankingScreen__tableBody}>
                  {/* 実際のランキングデータ */}
                  {currentPageData.map((entry, index) => (
                    <tr key={index} className={styles.rankingScreen__tableRow}>
                      <td className={styles.rankingScreen__tableCell}>
                        {startIndex + index + 1}
                      </td>
                      <td className={styles.rankingScreen__tableCell}>
                        {entry.name}
                      </td>
                      <td className={styles.rankingScreen__tableCell}>
                        {entry.kpm.toFixed(1)}
                      </td>
                      <td className={styles.rankingScreen__tableCell}>
                        {entry.accuracy.toFixed(1)}%
                      </td>
                      <td className={styles.rankingScreen__tableCell}>
                        {entry.correct}
                      </td>
                      <td className={styles.rankingScreen__tableCell}>
                        {entry.miss}
                      </td>
                    </tr>
                  ))}
                  {/* 6行に満たない場合は空の行を追加して高さを一定に保つ */}
                  {currentPageData.length < perPage && 
                    Array.from({ length: perPage - currentPageData.length }, (_, index) => (
                      <tr key={`empty-${index}`} className={`${styles.rankingScreen__tableRow} ${styles.rankingScreen__emptyRow}`}>
                        <td className={styles.rankingScreen__tableCell}>&nbsp;</td>
                        <td className={styles.rankingScreen__tableCell}>&nbsp;</td>
                        <td className={styles.rankingScreen__tableCell}>&nbsp;</td>
                        <td className={styles.rankingScreen__tableCell}>&nbsp;</td>
                        <td className={styles.rankingScreen__tableCell}>&nbsp;</td>
                        <td className={styles.rankingScreen__tableCell}>&nbsp;</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
              {/* Pagination */}
              {!loading && !error && rankings.length > 0 && totalPages > 1 && (
                <div className={styles.rankingScreen__pagination}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <div
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`${styles.rankingScreen__pageButton} ${
                        page === currentPage ? styles['rankingScreen__pageButton--active'] : ''
                      }`}
                    >
                      {page}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className={styles.rankingScreen__actions}>
          <div
            onClick={handleGoMenu}
            className={styles.rankingScreen__button}
          >
            戻る
          </div>
          <div
            onClick={handleGoMenu}
            className={styles.rankingScreen__button}
          >
            メインメニューに戻る
          </div>
        </div>
      </section>
    </div>
  );
};

export default CleanRankingScreen;
