"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { getRankingEntries, RankingEntry } from '@/lib/rankingManaby2';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';

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
    <div style={{
      boxSizing: 'border-box',
      margin: 0,
      width: '100%',
      minHeight: '100vh',
      fontFamily: 'Cinzel, serif',
      background: 'radial-gradient(ellipse at center, #0a0f1b, #000)',
      color: '#ccc',
      lineHeight: 1.5,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      {/* Ranking Section */}
      <section style={{
        width: '100%',
        maxWidth: '900px',
        animation: 'fadeIn 1.2s ease',
        textAlign: 'center'      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '4rem',
          color: '#c9a76f',
          letterSpacing: '0.4rem',
          textShadow: '0 0 12px rgba(255, 200, 120, 0.3)',
          margin: '0 0 2rem 0'
        }}>
          RANKING
        </h1>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {['normal', 'hard'].map((difficulty) => (
            <div
              key={difficulty}
              onClick={() => handleDifficultyChange(difficulty)}
              style={{
                padding: '0.5rem 1.5rem',
                border: activeDifficulty === difficulty ? '1px solid #88ccff' : '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(0,0,0,0.4)',
                color: activeDifficulty === difficulty ? '#b0d0ff' : '#ccc',
                cursor: 'pointer',
                transition: '0.3s',
                boxShadow: activeDifficulty === difficulty ? '0 0 6px rgba(100, 180, 255, 0.3)' : 'none'
              }}
            >
              {difficulty === 'normal' ? 'Normal' : 'Hard'}
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#ccc'
          }}>
            <div>ランキング読み込み中...</div>
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#ff6b6b'
          }}>
            <div>{error}</div>
            <button
              onClick={fetchRankings}
              style={{
                marginTop: '1rem',
                padding: '0.6rem 2.5rem',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                color: '#ddd',
                borderRadius: '2px',
                fontSize: '1rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: '0.2s ease',
                cursor: 'pointer',
                boxShadow: 'inset 0 0 0px rgba(255, 255, 255, 0.05)'
              }}
            >
              リトライ
            </button>
          </div>
        ) : rankings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#ccc'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>まだスコアがありません</h3>
            <p style={{ margin: 0 }}>
              ゲームをプレイして最初のランキング入りを目指しましょう！
            </p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '2.5rem'
          }}>
            <thead>
              <tr>
                <th style={{
                  padding: '0.8rem 1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  color: '#a9c9ff',
                  fontWeight: 'normal'
                }}>順位</th>
                <th style={{
                  padding: '0.8rem 1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  color: '#a9c9ff',
                  fontWeight: 'normal'
                }}>プレイヤー</th>
                <th style={{
                  padding: '0.8rem 1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  color: '#a9c9ff',
                  fontWeight: 'normal'
                }}>KPM</th>
                <th style={{
                  padding: '0.8rem 1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  color: '#a9c9ff',
                  fontWeight: 'normal'
                }}>正確率</th>
                <th style={{
                  padding: '0.8rem 1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  color: '#a9c9ff',
                  fontWeight: 'normal'
                }}>正解</th>
                <th style={{
                  padding: '0.8rem 1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  color: '#a9c9ff',
                  fontWeight: 'normal'
                }}>ミス</th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((entry, index) => (
                <tr key={index}>
                  <td style={{
                    padding: '0.8rem 1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                  }}>
                    {startIndex + index + 1}
                  </td>
                  <td style={{
                    padding: '0.8rem 1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                  }}>
                    {entry.name}
                  </td>
                  <td style={{
                    padding: '0.8rem 1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                  }}>
                    {entry.kpm.toFixed(1)}
                  </td>
                  <td style={{
                    padding: '0.8rem 1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                  }}>
                    {entry.accuracy.toFixed(1)}%
                  </td>
                  <td style={{
                    padding: '0.8rem 1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                  }}>
                    {entry.correct}
                  </td>
                  <td style={{
                    padding: '0.8rem 1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                  }}>
                    {entry.miss}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && !error && rankings.length > 0 && totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <div
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  cursor: 'pointer',
                  padding: '0.3rem 1rem',
                  border: page === currentPage ? '1px solid #88ccff' : '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(0,0,0,0.3)',
                  color: page === currentPage ? '#b0d0ff' : '#ccc',
                  borderRadius: '2px',
                  transition: '0.2s',
                  boxShadow: page === currentPage ? '0 0 6px rgba(100, 180, 255, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (page !== currentPage) {
                    e.currentTarget.style.color = '#b0d0ff';
                    e.currentTarget.style.borderColor = '#88ccff';
                    e.currentTarget.style.boxShadow = '0 0 6px rgba(100, 180, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== currentPage) {
                    e.currentTarget.style.color = '#ccc';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {page}
              </div>
            ))}          </div>
        )}

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center'
        }}>
          <div
            onClick={handleGoMenu}
            style={{
              cursor: 'pointer',
              padding: '0.6rem 2.5rem',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#ddd',
              borderRadius: '2px',
              fontSize: '1rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              transition: '0.2s ease',
              textAlign: 'center',
              boxShadow: 'inset 0 0 0px rgba(255, 255, 255, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#88ccff';
              e.currentTarget.style.color = '#b0d0ff';
              e.currentTarget.style.boxShadow = '0 0 6px rgba(100, 180, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              e.currentTarget.style.color = '#ddd';
              e.currentTarget.style.boxShadow = 'inset 0 0 0px rgba(255, 255, 255, 0.05)';
            }}
          >
            戻る
          </div>
          <div
            onClick={handleGoMenu}
            style={{
              cursor: 'pointer',
              padding: '0.6rem 2.5rem',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#ddd',
              borderRadius: '2px',
              fontSize: '1rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              transition: '0.2s ease',
              textAlign: 'center',
              boxShadow: 'inset 0 0 0px rgba(255, 255, 255, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#88ccff';
              e.currentTarget.style.color = '#b0d0ff';
              e.currentTarget.style.boxShadow = '0 0 6px rgba(100, 180, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              e.currentTarget.style.color = '#ddd';
              e.currentTarget.style.boxShadow = 'inset 0 0 0px rgba(255, 255, 255, 0.05)';
            }}
          >
            メインメニューに戻る
          </div>
        </div>
      </section>
    </div>
  );
};

export default CleanRankingScreen;
