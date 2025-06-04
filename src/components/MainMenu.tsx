import React, { useState, useCallback } from 'react';
import { useTypingGameStore, useQuestionCount } from '@/store/typingGameStore';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import styles from './MainMenu.eldenring.bem.module.css';
import { deleteRankingEntriesByMode } from '@/lib/rankingManaby2';
import CommonModal from './common/CommonModal';
import CommonButton from './common/CommonButton';
import OptimizedAudioSystem from '@/utils/OptimizedAudioSystem';

interface MainMenuProps {
  onStart: () => void;
  onRetry: () => void;
  onRanking: () => void;
}

// モード説明文オブジェクト
const modeDescriptions = {
  'normal': '一般的な入力練習モードです。基本的な言葉遣いを扱います。',
  'hard': '難易度の高い入力練習モードです。さらに高度な言葉を扱います。',
  'sonkeigo': '敬語の中でも「相手を高める」言葉遣いを学びます。',
  'kenjougo': '自分を下げて丁寧さを表現する「謙譲語」を練習します。',
  'business': 'ビジネスシーンでの適切な言葉選びとマナーを学ぶモードです。'
};

/**
 * MainMenu - 製品化レベル高品質メインメニュー
 * indexselect.htmlの完全再現 + アクセシビリティ + パフォーマンス最適化
 */
const MainMenu: React.FC<MainMenuProps> = ({ onStart, onRetry, onRanking }) => {
  const { resetGame, setGameStatus, setMode, setQuestionCount, mode } = useTypingGameStore();
  const { setLastScore, goToSettings } = useSceneNavigationStore(); // 状態管理ストアの使用
  const questionCount = useQuestionCount();
    // 状態管理
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminInput, setAdminInput] = useState(questionCount);
  const [adminStatus, setAdminStatus] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [modeSelectOpen, setModeSelectOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
    // パフォーマンス最適化 - useCallback
  const handleStart = useCallback(async () => {
    if (isStarting) return; // 重複実行防止
    
    setIsStarting(true);
    setError(null);
    
    try {
      OptimizedAudioSystem.init();
      await OptimizedAudioSystem.resumeAudioContext();
      resetGame();
      setGameStatus('playing');
      onStart();
    } catch (err) {
      setError('ゲームの開始に失敗しました。再度お試しください。');
      console.error('Game start error:', err);
    } finally {
      setIsStarting(false);
    }
  }, [resetGame, setGameStatus, onStart, isStarting]);
  // ランキング画面への移動をメモ化
  const handleGoRanking = useCallback(() => {
    onRanking();
  }, [onRanking]);

  // 設定画面への移動をメモ化
  const handleGoSettings = useCallback(() => {
    goToSettings();
  }, [goToSettings]);
    // モード選択ハンドラー
  const handleModeSelect = useCallback((newMode: 'normal' | 'hard' | 'sonkeigo' | 'kenjougo' | 'business') => {
    setMode(newMode);
    // setModeSelectOpen(false); // ← これを削除
  }, [setMode]);

  // モーダルのキーボードナビゲーション対応
  const handleModeSelectKeydown = useCallback((e: React.KeyboardEvent, newMode: 'normal' | 'hard' | 'sonkeigo' | 'kenjougo' | 'business') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleModeSelect(newMode);
    }
  }, [handleModeSelect]);
  // ショートカット定義
  useGlobalShortcuts([
    {
      key: ' ',
      handler: async (e) => {
        if (adminOpen || modeSelectOpen) return; // モーダルが開いているときは無効化
        e.preventDefault();
        await handleStart();
      },
    },      {
        key: 'r',
        altKey: true,
        handler: (e) => { if (!adminOpen && !modeSelectOpen) { e.preventDefault(); handleGoRanking(); } },
      },
    {
      key: 'Escape',
      handler: (e) => {
        if (modeSelectOpen) {
          e.preventDefault();
          setModeSelectOpen(false);
        }
      },
    },
    {
      key: '@',
      ctrlKey: true,
      handler: (e) => {
        e.preventDefault();
        setAdminOpen((v) => !v);
      },
      allowInputFocus: true    },
  ], [handleStart, handleGoRanking, adminOpen, modeSelectOpen]);
  // ランキングリセット関数
  const handleResetRanking = async (mode: 'normal' | 'hard') => {
    setAdminLoading(true);
    setAdminStatus(`${mode.toUpperCase()}ランキングをリセット中...`);
    try {
      const count = await deleteRankingEntriesByMode(mode);
      setAdminStatus(`${mode.toUpperCase()}ランキングを${count}件リセットしました`);
    } catch (e) {
      setAdminStatus(`${mode.toUpperCase()}ランキングリセット失敗`);
    } finally {
      setAdminLoading(false);
    }
  };  // 管理者モーダルの外側クリックで閉じる
  const handleAdminOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setAdminOpen(false);
    }  };  return (
    <div className={styles.mainMenu}>
      {/* メインコンテナ */}
      <div className={styles.mainMenu__container}>
        <div className={styles.mainMenu__title}>manabytype</div>
        <div className={styles.mainMenu__subtitle}>II</div>        <div className={styles.mainMenu__nav}>
          <div 
            className={`${styles.mainMenu__navItem} ${styles.menu__item} ${isStarting ? styles['mainMenu__navItem--loading'] : ''}`}
            onClick={handleStart}
            tabIndex={0}
            role="button"
            aria-label="ゲームを開始"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleStart();
              }
            }}
          >
            {isStarting ? 'STARTING...' : 'START GAME'}
          </div>
          <div 
            className={`${styles.mainMenu__navItem} ${styles.menu__item}`}
            onClick={() => setModeSelectOpen(true)}
            tabIndex={0}
            role="button"
            aria-label="プレイモードを選択"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setModeSelectOpen(true);
              }
            }}
          >
            SELECT MODE
          </div>
          <div 
            className={`${styles.mainMenu__navItem} ${styles.menu__item}`}
            onClick={handleGoRanking}
            tabIndex={0}
            role="button"
            aria-label="ランキングを表示"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleGoRanking();
              }
            }}
          >
            RANKING
          </div>          <div 
            className={`${styles.mainMenu__navItem} ${styles.menu__item}`}
            onClick={handleGoSettings}
            tabIndex={0}
            role="button"
            aria-label="システム設定"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleGoSettings();
              }
            }}
          >
            SYSTEM
          </div>
        </div>
        
        <div className={styles.mainMenu__selectedMode} role="status" aria-live="polite">
          Mode: {mode === 'normal' ? 'Normal' :
                 mode === 'hard' ? 'Hard' :
                 mode === 'sonkeigo' ? '尊敬語' :
                 mode === 'kenjougo' ? '謙譲語' :
                 mode === 'business' ? 'ビジネスマナー' : 'Normal'}
        </div>
      </div>      {/* ショートカットキー表示（index.htmlスタイル完全再現） */}
      <div className={styles.shortcut}>
        <span>[Space] Start</span>
        <span>[Alt+R] Rank</span>
      </div>

      {/* フッター（index.htmlスタイル完全再現） */}
      <div className={styles.footer}>
        <div className={styles.footer__copyright}>&copy;2025 manaby Omiya Studio</div>
        <div className={styles.footer__version}>ver. 0.9.3 (Beta)</div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className={styles.mainMenu__error} role="alert" aria-live="assertive">
          {error}
        </div>
      )}      {/* モードセレクトモーダル（index.htmlと完全同一デザイン） */}
      {modeSelectOpen && (
        <div 
          className={`${styles.modal} ${styles['modal--active']}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mode-select-title"
          id="modeModal"
        >
          <div 
            className={styles.modal__overlay} 
            onClick={() => setModeSelectOpen(false)}
          ></div>
          <div className={styles.modal__content}>
            <div className={styles.modal__sidebar} role="tablist" aria-label="プレイモード選択">
              <button 
                className={`${styles.modal__option} ${mode === 'normal' ? styles['modal__option--selected'] : ''}`}
                onClick={() => handleModeSelect('normal')}
                type="button"
                role="tab"
                aria-selected={mode === 'normal'}
              >
                Normal
              </button>
              <button 
                className={`${styles.modal__option} ${mode === 'sonkeigo' ? styles['modal__option--selected'] : ''}`}
                onClick={() => handleModeSelect('sonkeigo')}
                type="button"
                role="tab"
                aria-selected={mode === 'sonkeigo'}
              >
                尊敬語
              </button>
              <button 
                className={`${styles.modal__option} ${mode === 'kenjougo' ? styles['modal__option--selected'] : ''}`}
                onClick={() => handleModeSelect('kenjougo')}
                type="button"
                role="tab"
                aria-selected={mode === 'kenjougo'}
              >
                謙譲語
              </button>
              <button 
                className={`${styles.modal__option} ${mode === 'business' ? styles['modal__option--selected'] : ''}`}
                onClick={() => handleModeSelect('business')}
                type="button"
                role="tab"
                aria-selected={mode === 'business'}
              >
                ビジネスマナー
              </button>
            </div>
            <div className={styles.modal__main}>
              <div className={styles.modal__description}>
                {modeDescriptions[mode]}
              </div>
              <button 
                className={styles.modal__close} 
                onClick={() => setModeSelectOpen(false)}
                type="button"
                aria-label="モード選択を閉じる"
              >
                戻る
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 管理者モーダル */}
      <CommonModal open={adminOpen} onClose={() => setAdminOpen(false)}>
        <h2>管理者モード</h2>
        <label>
          出題数：
          <input
            type="number"
            min={1}
            max={100}
            value={adminInput}
            onChange={e => setAdminInput(Number(e.target.value))}
            disabled={adminLoading}
          />
          <CommonButton
            onClick={() => { setQuestionCount(adminInput); setAdminStatus(`出題数を${adminInput}問に変更しました`); }}
            disabled={adminLoading || adminInput < 1}
            variant="secondary"
          >反映</CommonButton>
        </label>
        <div>
          <CommonButton
            onClick={() => handleResetRanking('normal')}
            disabled={adminLoading}
            variant="secondary"
          >NORMALランキングリセット</CommonButton>
          <CommonButton
            onClick={() => handleResetRanking('hard')}
            disabled={adminLoading}
            variant="secondary"
          >HARDランキングリセット</CommonButton>
        </div>
        <div className={styles.mainMenu__adminStatus}>{adminStatus}</div>
      </CommonModal>
    </div>
  );
};

export default MainMenu;
