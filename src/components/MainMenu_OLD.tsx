import React, { useState, useCallback } from 'react';
import { useTypingGameStore, useQuestionCount } from '@/store/typingGameStore';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import styles from '@/styles/components/MainMenu.module.css';
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
 * MainMenu - 最適化エンジン統合版メインメニュー
 * START GAMEで直接最適化版が起動する本番実装
 */
const MainMenu: React.FC<MainMenuProps> = ({ onStart, onRetry, onRanking }) => {
  const { resetGame, setGameStatus, setMode, setQuestionCount, mode } = useTypingGameStore();
  const { setLastScore, goToGame } = useSceneNavigationStore();
  const questionCount = useQuestionCount();
  
  // 状態管理
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminInput, setAdminInput] = useState(questionCount);
  const [adminStatus, setAdminStatus] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [modeSelectOpen, setModeSelectOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [enableOptimization, setEnableOptimization] = useState(true);
  const [enablePerformanceMonitoring, setEnablePerformanceMonitoring] = useState(false);
  const [enableDebugMode, setEnableDebugMode] = useState(false);
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
  }, [onRanking]);  // 最適化ダッシュボードへの移動
  const handleOptimizationDashboard = useCallback(() => {
    goToGame();
  }, [goToGame]);
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
        <div className={styles.mainMenu__subtitle}>II</div>

        <div className={styles.mainMenu__nav}>
          <div 
            className={`${styles.mainMenu__navItem} ${isStarting ? styles['mainMenu__navItem--loading'] : ''}`}
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
            className={styles.mainMenu__navItem} 
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
          </div>          <div 
            className={styles.mainMenu__navItem} 
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
            className={styles.mainMenu__navItem}
            onClick={() => handleOptimizationDashboard()}
            tabIndex={0}
            role="button"
            aria-label="最適化システムダッシュボード"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOptimizationDashboard();
              }
            }}
          >
            OPTIMIZATION DEMO
          </div>
          <div 
            className={`${styles.mainMenu__navItem} ${styles['mainMenu__navItem--disabled']}`}
            tabIndex={0}
            role="button"
            aria-label="システム設定（準備中）"
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
      </div>

      {/* ショートカットキー表示（Elden Ringスタイル） */}
      <div className={styles.mainMenu__shortcutKeys}>
        <span>Space：ゲーム開始</span>
        <span>Alt+R：ランキング</span>
      </div>

      {/* コピーライト */}
      <div className={styles.mainMenu__copyright}>&copy;2025 manaby Omiya Studio. All rights reserved.</div>

      {/* バージョン */}
      <div className={styles.mainMenu__version}>App Ver. 1.01</div>

      {/* エラー表示 */}
      {error && (
        <div className={styles.mainMenu__error} role="alert" aria-live="assertive">
          {error}
        </div>
      )}      {/* モードセレクトモーダル（modeselect.htmlと同一デザイン） */}
      {modeSelectOpen && (
        <div 
          className={styles.modeSelect}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mode-select-title"
        >
          <div 
            className={styles.modeSelect__overlay} 
            onClick={() => setModeSelectOpen(false)}
          ></div>
          <div className={styles.modeSelect__wrapper}>
            <div className={styles.modeSelect__sidebar} role="tablist" aria-label="プレイモード選択">
              <button 
                className={`${styles.modeSelect__option} ${mode === 'normal' ? styles['modeSelect__option--selected'] : ''}`}
                onClick={() => handleModeSelect('normal')}
                type="button"
                role="tab"
                aria-selected={mode === 'normal'}
              >
                Normal
              </button>
              <button 
                className={`${styles.modeSelect__option} ${mode === 'sonkeigo' ? styles['modeSelect__option--selected'] : ''}`}
                onClick={() => handleModeSelect('sonkeigo')}
                type="button"
                role="tab"
                aria-selected={mode === 'sonkeigo'}
              >
                尊敬語
              </button>
              <button 
                className={`${styles.modeSelect__option} ${mode === 'kenjougo' ? styles['modeSelect__option--selected'] : ''}`}
                onClick={() => handleModeSelect('kenjougo')}
                type="button"
                role="tab"
                aria-selected={mode === 'kenjougo'}
              >
                謙譲語
              </button>
              <button 
                className={`${styles.modeSelect__option} ${mode === 'business' ? styles['modeSelect__option--selected'] : ''}`}
                onClick={() => handleModeSelect('business')}
                type="button"
                role="tab"
                aria-selected={mode === 'business'}
              >
                ビジネスマナー
              </button>
            </div>
            <div className={styles.modeSelect__content}>
              <div className={styles.modeSelect__description}>
                {modeDescriptions[mode]}
              </div>
              <button 
                className={styles.modeSelect__backButton} 
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
        </div>        <div className={styles.mainMenu__adminStatus}>{adminStatus}</div>
      </CommonModal>      {/* 設定モーダル */}
      <CommonModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      >
        <div className={styles.settingsModal__title}>
          ⚙️ 設定
        </div>
        <div className={styles.settingsModal__content}>
          <div className={styles.settingsModal__section}>
            🚀 最適化設定
          </div>          <label className={styles.settingsModal__option}>
            <input
              type="checkbox"
              checked={enableOptimization}
              onChange={(e) => {
                console.log('🔧 [Settings] Optimization toggle:', e.target.checked);
                e.stopPropagation(); // イベント伝播を防ぐ
                setEnableOptimization(e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()} // クリックの伝播を防ぐ
              className={styles.settingsModal__checkbox}
            />
            <span className={styles.settingsModal__optionText}>
              最適化エンジンを使用 {enableOptimization ? '✅' : '❌'}
            </span>
          </label>
          
          <div className={styles.settingsModal__description}>
            typingmania-ref流の超高速タイピングエンジンを使用します。
            従来版より約50%高速な応答速度を実現します。
          </div>
            <label className={styles.settingsModal__option}>
            <input
              type="checkbox"
              checked={enablePerformanceMonitoring}
              onChange={(e) => {
                console.log('🔧 [Settings] Performance monitoring toggle:', e.target.checked);
                e.stopPropagation();
                setEnablePerformanceMonitoring(e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              className={styles.settingsModal__checkbox}
            />
            <span className={styles.settingsModal__optionText}>
              パフォーマンス監視 {enablePerformanceMonitoring ? '✅' : '❌'}
            </span>
          </label>
          
          <label className={styles.settingsModal__option}>
            <input
              type="checkbox"
              checked={enableDebugMode}
              onChange={(e) => {
                console.log('🔧 [Settings] Debug mode toggle:', e.target.checked);
                e.stopPropagation();
                setEnableDebugMode(e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              className={styles.settingsModal__checkbox}
            />
            <span className={styles.settingsModal__optionText}>
              デバッグモード {enableDebugMode ? '✅' : '❌'}
            </span>
          </label>
          
          <div className={`${styles.settingsModal__status} ${enableOptimization ? styles['settingsModal__status--optimized'] : ''}`}>
            <div className={styles.settingsModal__statusTitle}>
              現在の設定状況:
            </div>
            <div className={styles.settingsModal__statusItem}>
              エンジン: {enableOptimization ? '🚀 最適化版 (Ultra Fast)' : '🔧 従来版 (Traditional)'}
            </div>
            <div className={styles.settingsModal__statusItem}>
              監視: {enablePerformanceMonitoring ? '📊 有効' : '📊 無効'}
            </div>
            <div className={styles.settingsModal__statusItem}>
              デバッグ: {enableDebugMode ? '🐛 有効' : '🐛 無効'}
            </div>
          </div>          <div className={styles.settingsModal__actions}>
            <button
              onClick={(e) => {
                console.log('🔧 [Settings] Save button clicked');
                e.stopPropagation();
                setSettingsOpen(false);
              }}
              className={styles.settingsModal__saveButton}
              type="button"
            >
              設定を保存
            </button>
          </div>
        </div>
      </CommonModal>
    </div>
  );
};

export default MainMenu;
