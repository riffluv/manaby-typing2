import React from 'react';
import type { GameScoreLog, PerWordScoreLog } from '@/types';

export type SimpleGameResultScreenProps = {
  onGoMenu: () => void;
  onGoRanking: () => void;
  resultScore?: GameScoreLog['total'] | null;
  scoreLog?: PerWordScoreLog[];
  onCalculateFallbackScore?: () => void;
};

/**
 * シンプルなゲーム結果画面（スコア表示機能付き）
 * - WebWorkerで計算されたスコアを表示
 * - 基本的な結果表示
 */
const SimpleGameResultScreen: React.FC<SimpleGameResultScreenProps> = ({ 
  onGoMenu, 
  onGoRanking,
  resultScore,
  scoreLog,
  onCalculateFallbackScore
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'monospace'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        padding: '2rem'
      }}>        {/* タイトル */}
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '2rem',
          color: '#00e0ff',
          textShadow: '0 0 20px rgba(0, 224, 255, 0.5)'
        }}>
          お疲れ様でした！
        </h1>
        
        {/* スコア表示 */}
        {resultScore ? (
          <div style={{
            marginBottom: '3rem',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.5rem',
              fontSize: '1.2rem'
            }}>
              <div>
                <div style={{ color: '#00e0ff', fontWeight: 'bold' }}>KPM</div>
                <div style={{ fontSize: '2rem', color: '#fff' }}>{Math.floor(resultScore.kpm)}</div>
              </div>
              <div>
                <div style={{ color: '#7cffcb', fontWeight: 'bold' }}>精度</div>
                <div style={{ fontSize: '2rem', color: '#fff' }}>{Math.floor(resultScore.accuracy)}%</div>
              </div>
              <div>
                <div style={{ color: '#10b981', fontWeight: 'bold' }}>正解</div>
                <div style={{ fontSize: '1.5rem', color: '#fff' }}>{resultScore.correct}</div>
              </div>
              <div>
                <div style={{ color: '#ef4444', fontWeight: 'bold' }}>ミス</div>
                <div style={{ fontSize: '1.5rem', color: '#fff' }}>{resultScore.miss}</div>
              </div>
            </div>
          </div>
        ) : scoreLog && scoreLog.length > 0 ? (
          <div style={{
            marginBottom: '3rem',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '1rem' }}>
              スコア計算中...
            </div>
            {onCalculateFallbackScore && (
              <button
                onClick={onCalculateFallbackScore}
                style={{
                  padding: '8px 16px',
                  fontSize: '1rem',
                  background: 'linear-gradient(45deg, #666, #888)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                スコアを表示
              </button>
            )}
          </div>
        ) : (
          <p style={{
            fontSize: '1.5rem',
            marginBottom: '3rem',
            lineHeight: '1.6',
            color: '#ccc'
          }}>
            タイピング練習が完了しました。<br />
            引き続き練習を頑張りましょう！
          </p>
        )}
        
        {/* メッセージ（スコアがない場合のみ） */}
        
        {/* ボタン */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onGoMenu}
            style={{
              padding: '12px 24px',
              fontSize: '1.2rem',
              background: 'linear-gradient(45deg, #00e0ff, #0080ff)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '150px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 224, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            メニューに戻る
          </button>
          
          <button
            onClick={onGoRanking}
            style={{
              padding: '12px 24px',
              fontSize: '1.2rem',
              background: 'linear-gradient(45deg, #666, #888)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '150px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(136, 136, 136, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ランキング
          </button>
        </div>
        
        {/* ショートカット情報 */}
        <div style={{
          marginTop: '3rem',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <p>ESC: メニューに戻る | R: ランキング</p>
        </div>
      </div>
    </div>
  );
};

SimpleGameResultScreen.displayName = 'SimpleGameResultScreen';
export default SimpleGameResultScreen;
