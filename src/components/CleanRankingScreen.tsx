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
  ], [handleGoMenu]);  return (
    <div className="ranking-screen-container" style={{
      boxSizing: 'border-box',
      margin: 0,
      width: '100vw',
      height: '100vh', // 明確にビューポート高さを設定
      fontFamily: 'Cinzel, serif',
      background: 'radial-gradient(ellipse at center, #0a0f1b, #000)',
      color: '#ccc',
      lineHeight: 1.5,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start', // centerからflex-startに変更
      padding: 'min(2rem, 2vh) min(5%, 2rem)', // DPI対応のpadding
      position: 'fixed', // fixedに変更してスクロール防止
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden' // スクロール完全禁止
    }}>      {/* Ranking Section */}
      <section style={{
        width: '100%',
        maxWidth: 'min(1200px, 90vw)', // DPI対応の最大幅
        height: 'calc(100vh - 8vh)', // 利用可能な高さを計算（パディング分を差し引く）
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 1.2s ease',
        textAlign: 'center',
        overflow: 'hidden' // セクション内でもスクロール制御
      }}>        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 4vw, 4rem)', // DPI対応のレスポンシブフォント
          color: '#c9a76f',
          letterSpacing: '0.4rem',
          textShadow: '0 0 12px rgba(255, 200, 120, 0.3)',
          margin: '0 0 min(2rem, 3vh) 0', // DPI対応のマージン
          flexShrink: 0 // タイトルが縮まないように
        }}>
          RANKING
        </h1>        {/* Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'min(2rem, 3vw)', // DPI対応のgap
          marginBottom: 'min(2rem, 3vh)', // DPI対応のマージン
          flexShrink: 0 // タブが縮まないように
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
        </div>        {/* Table */}
        <div style={{
          flex: 1, // 残りのスペースを占有
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0, // flexで高さを制御するため
          marginBottom: 'min(1rem, 2vh)' // DPI対応のマージン
        }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            flex: 1, // 利用可能な高さを使用
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#ccc'
          }}>
            <div>ランキング読み込み中...</div>
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center',
            flex: 1, // 利用可能な高さを使用
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#ff6b6b'
          }}>            <div>{error}</div>
            <button
              onClick={fetchRankings}
              style={{
                marginTop: 'min(1rem, 2vh)',
                padding: '0.6rem 2.5rem',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                color: '#ddd',
                borderRadius: '2px',
                fontSize: 'clamp(0.8rem, 1.5vw, 1rem)', // DPI対応のフォントサイズ
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: '0.2s ease',
                cursor: 'pointer',
                boxShadow: 'inset 0 0 0px rgba(255, 255, 255, 0.05)'
              }}
            >
              リトライ
            </button>          </div>) : rankings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            flex: 1, // 利用可能な高さを使用
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#ccc'
          }}>
            <h3 style={{ margin: '0 0 min(1rem, 2vh) 0', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)' }}>まだスコアがありません</h3>
            <p style={{ margin: 0, fontSize: 'clamp(0.9rem, 1.8vw, 1rem)' }}>
              ゲームをプレイして最初のランキング入りを目指しましょう！
            </p>
          </div>        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}>            <thead style={{
              display: 'table',
              width: '100%',
              tableLayout: 'fixed',
              flexShrink: 0
            }}><tr style={{
                display: 'table',
                width: '100%',
                tableLayout: 'fixed'
              }}>
                <th style={{
                  padding: 'min(0.8rem, 1.5vh) min(1rem, 2vw)',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  color: '#a9c9ff',
                  fontWeight: 'normal',
                  fontSize: 'clamp(0.8rem, 1.5vw, 1rem)'
                }}>順位</th>
                <th style={{
                  padding: 'min(0.8rem, 1.5vh) min(1rem, 2vw)',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  color: '#a9c9ff',
                  fontWeight: 'normal',
                  fontSize: 'clamp(0.8rem, 1.5vw, 1rem)'
                }}>プレイヤー</th><th style={{
                  padding: 'min(0.8rem, 1.5vh) min(1rem, 2vw)',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  color: '#a9c9ff',
                  fontWeight: 'normal',
                  fontSize: 'clamp(0.8rem, 1.5vw, 1rem)'
                }}>KPM</th>
                <th style={{
                  padding: 'min(0.8rem, 1.5vh) min(1rem, 2vw)',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  color: '#a9c9ff',
                  fontWeight: 'normal',
                  fontSize: 'clamp(0.8rem, 1.5vw, 1rem)'
                }}>正確率</th>
                <th style={{
                  padding: 'min(0.8rem, 1.5vh) min(1rem, 2vw)',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  color: '#a9c9ff',
                  fontWeight: 'normal',
                  fontSize: 'clamp(0.8rem, 1.5vw, 1rem)'
                }}>正解</th>
                <th style={{
                  padding: 'min(0.8rem, 1.5vh) min(1rem, 2vw)',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  color: '#a9c9ff',
                  fontWeight: 'normal',
                  fontSize: 'clamp(0.8rem, 1.5vw, 1rem)'
                }}>ミス</th>
              </tr>
            </thead>
            <tbody style={{
              display: 'block',
              flex: 1,
              overflowY: 'hidden',
              minHeight: 0
            }}>
              {currentPageData.map((entry, index) => (<tr key={index} style={{
                  display: 'table',
                  width: '100%',
                  tableLayout: 'fixed'
                }}>
                  <td style={{
                    padding: 'min(0.8rem, 1.5vh) min(1rem, 2vw)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center',
                    fontSize: 'clamp(0.8rem, 1.4vw, 0.95rem)'
                  }}>
                    {startIndex + index + 1}
                  </td>
                  <td style={{
                    padding: 'min(0.8rem, 1.5vh) min(1rem, 2vw)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center',
                    fontSize: 'clamp(0.8rem, 1.4vw, 0.95rem)'
                  }}>
                    {entry.name}
                  </td>
                  <td style={{
                    padding: 'min(0.8rem, 1.5vh) min(1rem, 2vw)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center',
                    fontSize: 'clamp(0.8rem, 1.4vw, 0.95rem)'                  }}>
                    {entry.kpm.toFixed(1)}
                  </td><td style={{
                    padding: 'min(0.8rem, 1.5vh) min(1rem, 2vw)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center',
                    fontSize: 'clamp(0.8rem, 1.4vw, 0.95rem)'
                  }}>
                    {entry.accuracy.toFixed(1)}%
                  </td>
                  <td style={{
                    padding: 'min(0.8rem, 1.5vh) min(1rem, 2vw)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center',
                    fontSize: 'clamp(0.8rem, 1.4vw, 0.95rem)'
                  }}>
                    {entry.correct}
                  </td>
                  <td style={{
                    padding: 'min(0.8rem, 1.5vh) min(1rem, 2vw)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center',
                    fontSize: 'clamp(0.8rem, 1.4vw, 0.95rem)'                  }}>
                    {entry.miss}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>

        {/* Pagination */}
        {!loading && !error && rankings.length > 0 && totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'min(1rem, 2vw)',
            marginBottom: 'min(2rem, 3vh)',
            flexShrink: 0 // ページネーションが縮まないように
          }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (              <div
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  cursor: 'pointer',
                  padding: 'min(0.3rem, 0.8vh) min(1rem, 2vw)',
                  border: page === currentPage ? '1px solid #88ccff' : '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(0,0,0,0.3)',
                  color: page === currentPage ? '#b0d0ff' : '#ccc',
                  borderRadius: '2px',
                  transition: '0.2s',
                  boxShadow: page === currentPage ? '0 0 6px rgba(100, 180, 255, 0.3)' : 'none',
                  fontSize: 'clamp(0.8rem, 1.4vw, 0.9rem)'
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
        )}        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: 'min(1.5rem, 3vw)',
          justifyContent: 'center',
          flexShrink: 0 // ボタンが縮まないように
        }}>
          <div
            onClick={handleGoMenu}
            style={{
              cursor: 'pointer',
              padding: 'min(0.6rem, 1.2vh) min(2.5rem, 4vw)',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#ddd',
              borderRadius: '2px',
              fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
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
          </div>          <div
            onClick={handleGoMenu}
            style={{
              cursor: 'pointer',
              padding: 'min(0.6rem, 1.2vh) min(2.5rem, 4vw)',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#ddd',
              borderRadius: '2px',
              fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
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
