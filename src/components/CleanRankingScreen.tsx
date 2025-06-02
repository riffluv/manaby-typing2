"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { getRankingEntries, RankingEntry } from '@/lib/rankingManaby2';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';

interface CleanRankingScreenProps {
  onGoMenu: () => void;
}

/**
 * クリーンなランキング画面 - CSS競合を避けるため最小限の実装
 * デザインは後で追加予定
 */
const CleanRankingScreen: React.FC<CleanRankingScreenProps> = ({ onGoMenu }) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDifficulty, setActiveDifficulty] = useState<string>('normal');

  // ランキングデータを取得
  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
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

  // ショートカットキー
  useGlobalShortcuts([
    {
      key: 'Escape',
      handler: (e) => {
        e.preventDefault();
        onGoMenu();
      },
    },
  ], [onGoMenu]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #1a2740, #0a0f1b)',
      color: '#e0e0e0',
      fontFamily: 'Cinzel, serif',
      padding: '2rem',
      boxSizing: 'border-box'
    }}>
      {/* ヘッダー */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 700,
          color: '#ffd88a',
          margin: 0,
          marginBottom: '1rem'
        }}>
          RANKING
        </h1>
        <p style={{ margin: 0, color: '#b8cfe7' }}>
          タイピングスコアランキング
        </p>
      </div>

      {/* 難易度選択 */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {['normal', 'hard'].map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => handleDifficultyChange(difficulty)}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              border: activeDifficulty === difficulty ? '2px solid #88ccff' : '1px solid rgba(255,255,255,0.2)',
              background: activeDifficulty === difficulty ? 'rgba(136, 204, 255, 0.1)' : 'rgba(255,255,255,0.05)',
              color: activeDifficulty === difficulty ? '#88ccff' : '#e0e0e0',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'inherit',
              fontWeight: 600
            }}
          >
            {difficulty === 'normal' ? 'NORMAL' : 'HARD'}
          </button>
        ))}
      </div>

      {/* ランキングテーブル */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#b8cfe7'
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
                padding: '0.5rem 1rem',
                background: '#88ccff',
                color: '#0a0f1b',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              リトライ
            </button>
          </div>
        ) : rankings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#b8cfe7'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>まだスコアがありません</h3>
            <p style={{ margin: 0 }}>
              ゲームをプレイして最初のランキング入りを目指しましょう！
            </p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead style={{ background: 'rgba(255,255,255,0.015)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.08)', color: '#b8cfe7', fontWeight: 600 }}>順位</th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.08)', color: '#b8cfe7', fontWeight: 600 }}>プレイヤー</th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.08)', color: '#b8cfe7', fontWeight: 600 }}>KPM</th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.08)', color: '#b8cfe7', fontWeight: 600 }}>正確率</th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.08)', color: '#b8cfe7', fontWeight: 600 }}>正解</th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.08)', color: '#b8cfe7', fontWeight: 600 }}>ミス</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((entry, index) => (
                <tr key={index} style={{
                  background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                }}>
                  <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    {entry.name}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)', color: '#88ccff', fontWeight: 600 }}>
                    {entry.kpm}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    {entry.accuracy}%
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    {entry.correct}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    {entry.miss}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 戻るボタン */}
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={onGoMenu}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: '#e0e0e0',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit',
            fontWeight: 600
          }}
        >
          ← メニューに戻る
        </button>
      </div>

      {/* ショートカット表示 */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)',
        padding: '0.5rem 1rem',
        borderRadius: '1rem',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '0.875rem',
        color: '#b8cfe7'
      }}>
        ESC: メニューに戻る
      </div>
    </div>
  );
};

export default CleanRankingScreen;
