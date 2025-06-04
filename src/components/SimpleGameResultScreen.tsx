import React, { useState, useEffect, useCallback } from 'react';
import type { GameScoreLog, PerWordScoreLog } from '@/types';
import { useRankingModal } from '@/hooks/useRankingModal';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore';
import RankingModal from './RankingModal';
import styles from '@/styles/components/SimpleGameResultScreen.module.css';

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
 * エルデンリング風リザルト画面（スコア表示機能付き）
 * - HTMLファイルと同じデザインを適用
 * - WebWorkerで計算されたスコアを表示
 * - ランキング登録機能
 */
const SimpleGameResultScreen: React.FC<SimpleGameResultScreenProps> = ({ 
  onGoMenu, 
  onGoRanking,
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

  // キーボードショートカット（メモ化されたハンドラーを使用）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalState.show) return; // モーダルが開いている場合は無視
      
      switch (e.key) {
        case 'Escape':
          handleGoMenu();
          break;
        case 'r':
        case 'R':
          handleGoRanking();
          break;
        case 'Enter':
          if (currentScore && !isScoreRegistered) {
            handleOpenRankingModal();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGoMenu, handleGoRanking, currentScore, isScoreRegistered, modalState.show, handleOpenRankingModal]);
  return (
    <div className={styles.resultScreen}>
      <main className={styles.result}>
        <h1 className={styles.resultTitle}>RESULT</h1>

        {/* スコア表示 */}
        {currentScore ? (
          <section className={styles.resultStats}>            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>KPM</span>
              <span className={styles.resultStatValue}>{Math.floor(currentScore.kpm)}</span>
            </div>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>精度</span>
              <span className={styles.resultStatValue}>{Math.floor(currentScore.accuracy)}%</span>
            </div>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>正解</span>
              <span className={styles.resultStatValue}>{currentScore.correct}</span>
            </div>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>ミス</span>
              <span className={styles.resultStatValue}>{currentScore.miss}</span>
            </div>
          </section>        ) : scoreLog && scoreLog.length > 0 ? (
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
        ) : null}        <div className={styles.resultButtons}>
          {/* ランキング登録ボタン（スコアがあり、まだ登録していない場合のみ表示） */}
          {currentScore && !isScoreRegistered && (
            <div className={styles.resultButton} onClick={handleOpenRankingModal}>
              ランキング登録
            </div>
          )}
          <div className={styles.resultButton} onClick={handleGoMenu}>
            メニューに戻る
          </div>
          <div className={styles.resultButton} onClick={handleGoRanking}>
            ランキング
          </div>
        </div>
      </main>      {/* ランキング登録モーダル */}
      <div className={`${styles.modalOverlay} ${modalState.show ? styles.modalActive : ''}`}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>名前を入力</h2>
          <form onSubmit={handleSubmitRanking}>
            <input
              type="text"
              className={styles.modalInput}
              value={modalState.name}
              onChange={(e) => dispatch({ type: 'setName', name: e.target.value })}
              placeholder="Your Name"
              disabled={modalState.registering}
            />
            <div className={styles.modalActions}>
              <button
                type="submit"
                className={styles.modalButton}
                disabled={modalState.registering || !modalState.name.trim()}
              >
                {modalState.registering ? '登録中...' : '登録'}
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
          </form>{modalState.error && (
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
    </div>
  );
};

SimpleGameResultScreen.displayName = 'SimpleGameResultScreen';
export default SimpleGameResultScreen;
