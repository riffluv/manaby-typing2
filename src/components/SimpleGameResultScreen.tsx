import React, { useState, useEffect } from 'react';
import type { GameScoreLog, PerWordScoreLog } from '@/types';
import { useRankingModal } from '@/hooks/useRankingModal';
import RankingModal from './RankingModal';

// sessionStorageのキー
const LAST_SCORE_KEY = 'typing_game_last_score';

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
 * - ランキング登録機能
 */
const SimpleGameResultScreen: React.FC<SimpleGameResultScreenProps> = ({ 
  onGoMenu, 
  onGoRanking,
  resultScore,
  scoreLog,
  onCalculateFallbackScore
}) => {
  // ランキング登録状態管理
  const [isScoreRegistered, setIsScoreRegistered] = useState(false);
  
  // 現在のスコア状態（propsまたはsessionStorageから復元）
  const [currentScore, setCurrentScore] = useState<GameScoreLog['total'] | null>(null);

  // 初期化時にスコアを設定
  useEffect(() => {
    if (resultScore) {
      // 新しいスコアがpropsで渡された場合
      setCurrentScore(resultScore);
      // sessionStorageに保存
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(LAST_SCORE_KEY, JSON.stringify(resultScore));
      }
    } else {
      // propsにスコアがない場合、sessionStorageから復元を試みる
      if (typeof window !== 'undefined') {
        const savedScore = sessionStorage.getItem(LAST_SCORE_KEY);
        if (savedScore) {
          try {
            setCurrentScore(JSON.parse(savedScore));
          } catch (e) {
            console.warn('Failed to parse saved score:', e);
          }
        }
      }
    }
  }, [resultScore]);
  
  // ランキングモーダルフック
  const { modalState, dispatch, handleRegisterRanking } = useRankingModal(
    currentScore,
    isScoreRegistered,
    () => setIsScoreRegistered(true)
  );

  // ランキング登録ボタンのクリックハンドラ
  const handleOpenRankingModal = () => {
    dispatch({ type: 'open' });
  };

  // フォーム送信ハンドラ
  const handleSubmitRanking = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegisterRanking();
  };

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalState.show) return; // モーダルが開いている場合は無視
      
      switch (e.key) {
        case 'Escape':
          onGoMenu();
          break;
        case 'r':
        case 'R':
          onGoRanking();
          break;        case 'Enter':
          if (currentScore && !isScoreRegistered) {
            handleOpenRankingModal();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onGoMenu, onGoRanking, currentScore, isScoreRegistered, modalState.show, handleOpenRankingModal]);    return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem 1rem',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>      <div style={{
        textAlign: 'center',
        maxWidth: '800px',
        width: '100%',
        padding: '2rem',
        background: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        boxSizing: 'border-box'
      }}>{/* タイトル */}
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '2rem',
          letterSpacing: '-0.025em'
        }}>
          お疲れ様でした！
        </h1>

        {/* スコア表示 */}
        {currentScore ? (
          <div style={{
            marginBottom: '2rem',
            padding: '2rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            textAlign: 'center',
            background: '#fafafa',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '1.5rem',
              fontSize: '1rem'
            }}>
              <div>
                <div>KPM</div>
                <div style={{ fontSize: '1.5rem' }}>{Math.floor(currentScore.kpm)}</div>
              </div>
              <div>
                <div>精度</div>
                <div style={{ fontSize: '1.5rem' }}>{Math.floor(currentScore.accuracy)}%</div>
              </div>
              <div>
                <div>正解</div>
                <div style={{ fontSize: '1.2rem' }}>{currentScore.correct}</div>
              </div>
              <div>
                <div>ミス</div>
                <div style={{ fontSize: '1.2rem' }}>{currentScore.miss}</div>
              </div>
            </div>
          </div>
        ) : scoreLog && scoreLog.length > 0 ? (
          <div style={{
            marginBottom: '2rem',
            padding: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1rem', marginBottom: '1rem' }}>
              スコア計算中...
            </div>
            {onCalculateFallbackScore && (
              <button
                onClick={onCalculateFallbackScore}
                className="btn"
              >
                スコアを表示
              </button>
            )}
          </div>
        ) : null}
        
        {/* 最小スペース確保 */}
        {!currentScore && (!scoreLog || scoreLog.length === 0) && (
          <div style={{ height: '2rem' }} />
        )}
        
        {/* ボタン */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {/* ランキング登録ボタン（スコアがあり、まだ登録していない場合のみ表示） */}
          {currentScore && !isScoreRegistered && (
            <button
              onClick={handleOpenRankingModal}
              className="btn"
            >
              ランキング登録
            </button>
          )}
          
          <button
            onClick={onGoMenu}
            className="btn"
          >
            メニューに戻る
          </button>
          
          <button
            onClick={onGoRanking}
            className="btn"
          >
            ランキング
          </button>
        </div>        
        {/* ショートカット情報 */}
        <div style={{
          marginTop: '2rem',
          fontSize: '0.9rem'
        }}>
          <p>ESC: メニューに戻る | R: ランキング{currentScore && !isScoreRegistered ? ' | ENTER: ランキング登録' : ''}</p>
        </div>
      </div>

      {/* ランキング登録モーダル */}
      <RankingModal
        show={modalState.show}
        name={modalState.name}
        registering={modalState.registering}
        done={modalState.done}
        error={modalState.error}
        isScoreRegistered={isScoreRegistered}
        onSubmit={handleSubmitRanking}
        onChangeName={(name) => dispatch({ type: 'setName', name })}
        onClose={() => dispatch({ type: 'close' })}
      />
    </div>
  );
};

SimpleGameResultScreen.displayName = 'SimpleGameResultScreen';
export default SimpleGameResultScreen;
