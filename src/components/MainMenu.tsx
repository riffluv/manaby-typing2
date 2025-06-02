import PortalShortcut from '@/components/PortalShortcut';
import React, { useState, useCallback, useMemo } from 'react';
import { useTypingGameStore, useQuestionCount } from '@/store/typingGameStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import styles from './MainMenu_production.module.css';
import { deleteRankingEntriesByMode } from '@/lib/rankingManaby2';
import CommonModal from './common/CommonModal';
import CommonButton from './common/CommonButton';
import OptimizedAudioSystem from '@/utils/OptimizedAudioSystem';

interface MainMenuProps {
  onStart: () => void;
  onRetry: () => void;
  onRanking: () => void;
}

/**
 * MainMenu - 製品化レベル高品質メインメニュー
 * indexselect.htmlの完全再現 + アクセシビリティ + パフォーマンス最適化
 */
const MainMenu: React.FC<MainMenuProps> = ({ onStart, onRetry, onRanking }) => {
  const { resetGame, setGameStatus, setMode, setQuestionCount, mode } = useTypingGameStore();
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
  }, [resetGame, setGameStatus, onStart, isStarting]);  // 依存関係追加
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
    },
    {
      key: 'r',
      altKey: true,
      handler: (e) => { if (!adminOpen && !modeSelectOpen) { e.preventDefault(); onRanking(); } },
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
      allowInputFocus: true
    },
  ], [handleStart, onRanking, adminOpen, modeSelectOpen]);
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
    <div className={styles.isolatedMainMenu}>
      {/* メインコンテナ */}
      <div className={styles.container}>
        <h1 className={styles.titleMain}>manabytype</h1>
        <h2 className={styles.titleSub}>II</h2>        <nav className={styles.menu} role="navigation" aria-label="メインメニュー">
          <button 
            className={styles.menuItem} 
            onClick={handleStart}
            type="button"
            aria-label="ゲームを開始"
            disabled={isStarting}
          >
            {isStarting ? 'STARTING...' : 'START GAME'}
          </button>
          <button 
            className={styles.menuItem} 
            onClick={() => setModeSelectOpen(true)}
            type="button"
            aria-label="プレイモードを選択"
            disabled={isStarting}
          >
            SELECT MODE
          </button>
          <button 
            className={styles.menuItem} 
            onClick={onRanking}
            type="button"
            aria-label="ランキングを表示"
            disabled={isStarting}
          >
            RANKING
          </button>
          <button 
            className={styles.menuItem}
            type="button"
            aria-label="システム設定"
            disabled
          >
            SYSTEM
          </button>
        </nav>
        
        {/* エラー表示 */}
        {error && (
          <div className={styles.errorMessage} role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        
        <div className={styles.selectedMode} role="status" aria-live="polite">
          Mode: {mode === 'normal' ? 'Normal' :
                 mode === 'hard' ? 'Hard' :
                 mode === 'sonkeigo' ? '尊敬語' :
                 mode === 'kenjougo' ? '謙譲語' :
                 mode === 'business' ? 'ビジネスマナー' : 'Normal'}
        </div>
      </div>{/* ショートカットキー */}
      <PortalShortcut
        shortcuts={[
          { key: 'Space', label: 'ゲーム開始' },
          { key: ['Alt', 'R'], label: 'ランキング' },
        ]}
      />

      {/* コピーライト */}
      <div className={styles.copyright}>&copy;2025 manaby Omiya Studio. All rights reserved.</div>      {/* バージョン */}
      <div className={styles.version}>App Ver. 1.01</div>      {/* モードセレクトモーダル */}
      {modeSelectOpen && (
        <div 
          className={styles.modeSelectScreen}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mode-select-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModeSelectOpen(false);
            }
          }}
        >
          <div className={styles.modeWrapper}>
            <div className={styles.modeSidebar} role="tablist" aria-label="プレイモード選択">
              <h3 id="mode-select-title" style={{ display: 'none' }}>プレイモード選択</h3>
              <button 
                className={`${styles.modeOption} ${mode === 'normal' ? styles.selected : ''}`}
                onClick={() => handleModeSelect('normal')}
                type="button"
                role="tab"
                aria-selected={mode === 'normal'}
                aria-controls="mode-description"
              >
                Normal
              </button>
              <button 
                className={`${styles.modeOption} ${mode === 'sonkeigo' ? styles.selected : ''}`}
                onClick={() => handleModeSelect('sonkeigo')}
                type="button"
                role="tab"
                aria-selected={mode === 'sonkeigo'}
                aria-controls="mode-description"
              >
                尊敬語
              </button>
              <button 
                className={`${styles.modeOption} ${mode === 'kenjougo' ? styles.selected : ''}`}
                onClick={() => handleModeSelect('kenjougo')}
                type="button"
                role="tab"
                aria-selected={mode === 'kenjougo'}
                aria-controls="mode-description"
              >
                謙譲語
              </button>
              <button 
                className={`${styles.modeOption} ${mode === 'business' ? styles.selected : ''}`}
                onClick={() => handleModeSelect('business')}
                type="button"
                role="tab"
                aria-selected={mode === 'business'}
                aria-controls="mode-description"
              >
                ビジネスマナー
              </button>
            </div>
            <div className={styles.modeContent}>
              <div 
                className={styles.modeDescription}
                id="mode-description"
                role="tabpanel"
                aria-live="polite"
              >
                {mode === 'normal' ? '一般的な入力練習モードです。基本的な言葉遣いを扱います。' :
                 mode === 'hard' ? '高難易度タイピング練習モードです。' :
                 mode === 'sonkeigo' ? '敬語の中でも「相手を高める」言葉遣いを学びます。' :
                 mode === 'kenjougo' ? '自分を下げて丁寧さを表現する「謙譲語」を練習します。' :
                 mode === 'business' ? 'ビジネスシーンでの適切な言葉選びとマナーを学ぶモードです。' :
                 '一般的な入力練習モードです。基本的な言葉遣いを扱います。'}
              </div>
              <button 
                className={styles.backButton} 
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
        <div className={styles['admin-status']}>{adminStatus}</div>
      </CommonModal>
    </div>
  );
};

export default MainMenu;
