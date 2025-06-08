import React, { useState, useCallback, useMemo } from 'react';
import { useTypingGameStore, useQuestionCount } from '@/store/typingGameStore';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import styles from './MainMenu.eldenring.bem.module.css';
import { deleteRankingEntriesByMode } from '@/lib/rankingManaby2';
import CommonModal from './common/CommonModal';
import CommonButton from './common/CommonButton';
import AdminModal from './AdminModal';
import OptimizedAudioSystem from '@/utils/OptimizedAudioSystem';

interface MainMenuProps {
  onStart: () => void;
  onRetry: () => void;
  onRanking: () => void;
}

// モード説明文オブジェクト
const modeDescriptions: Record<string, string> = {
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
const MainMenu: React.FC<MainMenuProps> = React.memo(({ onStart, onRetry, onRanking }) => {
  // 直接のstore使用に変更
  const mode = useTypingGameStore((state) => state.mode);
  const resetGame = useTypingGameStore((state) => state.resetGame);
  const setGameStatus = useTypingGameStore((state) => state.setGameStatus);
  const setMode = useTypingGameStore((state) => state.setMode);
  const { setLastScore, goToSettings } = useSceneNavigationStore();
  const questionCount = useQuestionCount();
  
  // セキュリティチェック: 開発環境でのみ管理者機能を有効化
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // 状態管理
  const [adminOpen, setAdminOpen] = useState(false);
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
  }, [handleModeSelect]);  // ショートカット定義をメモ化
  const shortcuts = useMemo(() => [
    {
      key: ' ',
      handler: async (e: KeyboardEvent) => {
        if (adminOpen || modeSelectOpen) return; // モーダルが開いているときは無効化
        e.preventDefault();
        await handleStart();
      },
    },
    {
      key: 'r',
      altKey: true,
      handler: (e: KeyboardEvent) => { 
        if (!adminOpen && !modeSelectOpen) { 
          e.preventDefault(); 
          handleGoRanking(); 
        } 
      },
    },
    {
      key: 'Escape',
      handler: (e: KeyboardEvent) => {
        if (modeSelectOpen) {
          e.preventDefault();
          setModeSelectOpen(false);
        }
      },
    },
    {
      key: '@',
      ctrlKey: true,
      handler: (e: KeyboardEvent) => {
        // 本番環境では管理者パネルを無効化
        if (!isDevelopment) {
          console.warn('🚨 Admin panel is disabled in production environment');
          return;
        }
        e.preventDefault();
        setAdminOpen((v) => !v);
      },
      allowInputFocus: true
    },
  ], [handleStart, handleGoRanking, adminOpen, modeSelectOpen, isDevelopment]);

  useGlobalShortcuts(shortcuts);

  // selectedModeのメモ化
  const selectedModeDisplay = useMemo(() => {
    switch (mode) {
      case 'normal': return 'Normal';
      case 'hard': return 'Hard';
      case 'sonkeigo': return '尊敬語';
      case 'kenjougo': return '謙譲語';
      case 'business': return 'ビジネスマナー';
      default: return 'Normal';
    }
  }, [mode]);

  return (
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
          Mode: {selectedModeDisplay}
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
          </div>        </div>
      )}      {/* 管理者モーダル - 開発環境でのみ有効 */}
      {isDevelopment && (
        <AdminModal 
          isOpen={adminOpen} 
          onClose={() => setAdminOpen(false)} 
        />      )}
    </div>
  );
});

MainMenu.displayName = 'MainMenu';

export default MainMenu;
