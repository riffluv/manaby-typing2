import PortalShortcut from '@/components/PortalShortcut';
import React, { useState } from 'react';
import { useTypingGameStore, useQuestionCount } from '@/store/typingGameStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import styles from './MainMenu_manabytype_fixed.module.css';
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
 * monkeytype × THE FINALS インスパイアード メインメニュー
 * サイバーパンク美学とミニマリズムを融合したプロゲーマー向けUI
 */
const MainMenu: React.FC<MainMenuProps> = ({ onStart, onRetry, onRanking }) => {
  const { resetGame, setGameStatus, setMode, setQuestionCount, mode } = useTypingGameStore();
  const questionCount = useQuestionCount();  // 管理者モード状態
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminInput, setAdminInput] = useState(questionCount);
  const [adminStatus, setAdminStatus] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  // モード選択モーダル状態
  const [modeSelectOpen, setModeSelectOpen] = useState(false);
  // ゲーム開始ハンドラー
  const handleStart = async () => {
    OptimizedAudioSystem.init();
    await OptimizedAudioSystem.resumeAudioContext();
    resetGame();
    setGameStatus('playing');
    onStart();
  };  // モード選択ハンドラー
  const handleModeSelect = (newMode: 'normal' | 'hard' | 'sonkeigo' | 'kenjougo' | 'business') => {
    setMode(newMode);
    setModeSelectOpen(false);
  };
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
    }
  };  return (
    <div className={styles.mainMenuWrapper}>
      {/* メインコンテナ */}
      <div className={styles.container}>
        <div className={styles.titleMain}>manabytype</div>
        <div className={styles.titleSub}>II</div>
        <div className={styles.menu}>
          <div className={styles.menuItem} onClick={handleStart}>START GAME</div>
          <div className={styles.menuItem} onClick={() => setModeSelectOpen(true)}>SELECT MODE</div>
          <div className={styles.menuItem} onClick={onRanking}>RANKING</div>
          <div className={styles.menuItem}>SYSTEM</div>
        </div>
        <div className={styles.selectedMode}>
          Mode: {mode === 'normal' ? 'Normal' :
                 mode === 'hard' ? 'Hard' :
                 mode === 'sonkeigo' ? '尊敬語' :
                 mode === 'kenjougo' ? '謙譲語' :
                 mode === 'business' ? 'ビジネスマナー' : 'Normal'}
        </div>
      </div>

      {/* ショートカットキー */}
      <div className={styles.shortcutKeys}>
        <span>Space：ゲーム開始</span>
        <span>Alt+R：ランキング</span>
      </div>

      {/* コピーライト */}
      <div className={styles.copyright}>&copy;2025 manaby Omiya Studio. All rights reserved.</div>

      {/* バージョン */}
      <div className={styles.version}>App Ver. 2.0.0</div>

      {/* モードセレクトモーダル */}
      {modeSelectOpen && (
        <div className={styles.modeSelectScreen}>
          <div className={styles.modeWrapper}>
            <div className={styles.modeSidebar}>
              <div 
                className={`${styles.modeOption} ${mode === 'normal' ? styles.selected : ''}`}
                onClick={() => handleModeSelect('normal')}
              >
                Normal
              </div>
              <div 
                className={`${styles.modeOption} ${mode === 'sonkeigo' ? styles.selected : ''}`}
                onClick={() => handleModeSelect('sonkeigo')}
              >
                尊敬語
              </div>
              <div 
                className={`${styles.modeOption} ${mode === 'kenjougo' ? styles.selected : ''}`}
                onClick={() => handleModeSelect('kenjougo')}
              >
                謙譲語
              </div>
              <div 
                className={`${styles.modeOption} ${mode === 'business' ? styles.selected : ''}`}
                onClick={() => handleModeSelect('business')}
              >
                ビジネスマナー
              </div>
            </div>
            <div className={styles.modeContent}>
              <div className={styles.modeDescription}>
                {mode === 'normal' ? '一般的な入力練習モードです。基本的な言葉遣いを扱います。' :
                 mode === 'hard' ? '高難易度タイピング練習モードです。' :
                 mode === 'sonkeigo' ? '敬語の中でも「相手を高める」言葉遣いを学びます。' :
                 mode === 'kenjougo' ? '自分を下げて丁寧さを表現する「謙譲語」を練習します。' :
                 mode === 'business' ? 'ビジネスシーンでの適切な言葉選びとマナーを学ぶモードです。' :
                 '一般的な入力練習モードです。基本的な言葉遣いを扱います。'}
              </div>
              <div className={styles.backButton} onClick={() => setModeSelectOpen(false)}>
                戻る
              </div>
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
