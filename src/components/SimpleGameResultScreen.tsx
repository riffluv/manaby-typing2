import React, { useState, useEffect, useCallback } from 'react';
import type { GameScoreLog, PerWordScoreLog } from '@/types';
import { useRankingModal } from '@/hooks/useRankingModal';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import styles from '@/styles/components/SimpleGameResultScreen.module.css';

// sessionStorageのキー
const LAST_SCORE_KEY = 'typing_game_last_score';

export type SimpleGameResultScreenProps = {
  onGoMenu: () => void;
  onGoRanking: () => void;
  onRetry?: () => void;
  resultScore?: GameScoreLog['total'] | null;
  scoreLog?: PerWordScoreLog[];
  onCalculateFallbackScore?: () => void;
};

/**
 * エルデンリング風リザルト画面（スコア表示機能付き）
 * - HTMLファイルと同じデザインを適用
 * - WebWorkerで計算されたスコアを表示
 * - ランキング登録機能
 * - React最適化版: React.memo + useCallback最適化
 */
const SimpleGameResultScreen: React.FC<SimpleGameResultScreenProps> = React.memo(({ 
  onGoMenu, 
  onGoRanking,
  onRetry,
  resultScore,
  scoreLog,
  onCalculateFallbackScore
}) => {
  // 状態管理ストアの使用
  const { setLastScore } = useSceneNavigationStore();
  
  // ランキング登録状態管理
  const [isScoreRegistered, setIsScoreRegistered] = useState(false);
  
  // 現在のスコア状態（propsまたはsessionStorageから復元）
  const [currentScore, setCurrentScore] = useState<GameScoreLog['total'] | null>(null);

  // メニューに戻る処理をメモ化
  const handleGoMenu = useCallback(() => {
    // スコアデータをストアに保存
    if (currentScore && scoreLog) {
      setLastScore(scoreLog, currentScore);
    }
    onGoMenu();
  }, [currentScore, scoreLog, setLastScore, onGoMenu]);
  // ランキングに移動する処理をメモ化
  const handleGoRanking = useCallback(() => {
    // スコアデータをストアに保存
    if (currentScore && scoreLog) {
      setLastScore(scoreLog, currentScore);
    }
    onGoRanking();
  }, [currentScore, scoreLog, setLastScore, onGoRanking]);

  // リトライ処理をメモ化
  const handleRetry = useCallback(() => {
    // スコアデータをストアに保存
    if (currentScore && scoreLog) {
      setLastScore(scoreLog, currentScore);
    }
    if (onRetry) {
      onRetry();
    }
  }, [currentScore, scoreLog, setLastScore, onRetry]);

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
  };  // キーボードショートカット（useGlobalShortcutsを使用）
  useGlobalShortcuts([
    {
      key: 'Escape',
      handler: (e) => {
        if (modalState.show) return; // モーダルが開いている場合は無視
        e.preventDefault();
        handleGoMenu();
      },
    },
    {
      key: 'r',
      handler: (e) => {
        if (modalState.show) return; // モーダルが開いている場合は無視
        if (onRetry) {
          e.preventDefault();
          handleRetry();
        }
      },
    },
    {
      key: 'r',
      altKey: true,
      handler: (e) => {
        if (modalState.show) return; // モーダルが開いている場合は無視
        e.preventDefault();
        handleGoRanking();
      },
    },
    // 🚀 修正: Enterキーでの自動モーダル開放を無効化
    // リザルト画面では手動でRegisterボタンをクリックしてもらう
    // {
    //   key: 'Enter',
    //   handler: (e) => {
    //     if (modalState.show) return; // モーダルが開いている場合は無視
    //     if (currentScore && !isScoreRegistered) {
    //       e.preventDefault();
    //       handleOpenRankingModal();
    //     }
    //   },
    // },
  ], [handleGoMenu, handleGoRanking, handleRetry, modalState.show, onRetry]);
  return (
    <div className={styles.resultScreen}>
      <div className={styles.result}>
        <div className={styles.resultTitle}>RESULT</div>        {/* スコア表示 */}
        {currentScore ? (
          <div className={styles.resultStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>KPM</span>
              <span className={styles.statValue}>{Math.floor(currentScore.kpm || 0)}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Accuracy</span>
              <span className={styles.statValue}>{Math.floor(currentScore.accuracy || 0)}%</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Correct</span>
              <span className={styles.statValue}>{currentScore.correct || 0}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Misses</span>
              <span className={styles.statValue}>{currentScore.miss || 0}</span>
            </div>
          </div>
        ) : scoreLog && scoreLog.length > 0 ? (
          <div className={styles.scoreCalculating}>
            <div className={styles.message}>
              スコア計算中...
            </div>
            {onCalculateFallbackScore && (
              <button
                onClick={onCalculateFallbackScore}
                className={styles.button}
              >
                スコアを表示
              </button>
            )}
          </div>
        ) : null}

        <div className={styles.resultButtons}>
          {/* ランキング登録ボタン（スコアがあり、まだ登録していない場合のみ表示） */}
          {currentScore && !isScoreRegistered && (
            <div className={styles.resultButton} onClick={handleOpenRankingModal}>
              Register
            </div>
          )}
          <div className={styles.resultButton} onClick={handleGoMenu}>
            Back to Menu
          </div>
          <div className={styles.resultButton} onClick={handleGoRanking}>
            View Ranking
          </div>        </div>
      </div>

      {/* ランキング登録モーダル */}
      <div className={`${styles.modalOverlay} ${modalState.show ? styles.modalActive : ''}`}>
        <div className={styles.modalContent}>
          <div className={styles.modalTitle}>Enter Your Name</div>
          <form onSubmit={handleSubmitRanking}>
            <input
              type="text"
              className={styles.modalInput}
              value={modalState.name}
              onChange={(e) => dispatch({ type: 'setName', name: e.target.value })}
              placeholder="Your Name"
              maxLength={12}
              disabled={modalState.registering}
            />
            <div className={styles.modalActions}>
              <button
                type="submit"
                className={styles.modalButton}
                disabled={modalState.registering || !modalState.name.trim()}
              >
                {modalState.registering ? '登録中...' : 'Register'}
              </button>
              <button
                type="button"
                className={`${styles.modalButton} ${styles.modalButtonSecondary}`}
                onClick={() => dispatch({ type: 'close' })}
                disabled={modalState.registering}
              >
                キャンセル
              </button>
            </div>
          </form>
          {modalState.error && (
            <div className={styles.modalError}>
              {modalState.error}
            </div>
          )}
          {modalState.done && (
            <div className={styles.modalSuccess}>
              ランキングに登録されました！
            </div>
          )}
        </div>
      </div>
    </div>  );
});

SimpleGameResultScreen.displayName = 'SimpleGameResultScreen';
export default SimpleGameResultScreen;
