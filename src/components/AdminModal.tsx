import React, { useState, useCallback } from 'react';
import { useQuestionCount, useTypingGameStore } from '@/store/typingGameStore';
import { deleteRankingEntriesByMode } from '@/lib/rankingManaby2';
import { isAdminEnabled, logAdminAccess, showSecurityWarning } from '@/utils/adminSecurity';
import styles from './AdminModal.module.css';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 管理者パネルモーダルコンポーネント - React最適化版
 * admin.htmlのデザインを完全再現
 * Cinzelフォント、ダークグラデーション、ゴールドアクセントカラー
 * 
 * セキュリティ: 開発環境でのみ有効
 * React最適化: React.memo + useCallback最適化
 */
const AdminModal: React.FC<AdminModalProps> = React.memo(({ isOpen, onClose }) => {
  const questionCount = useQuestionCount();
  const { setQuestionCount } = useTypingGameStore();
  
  // 状態管理 - フックは常にトップレベルで呼び出す
  const [questionInput, setQuestionInput] = useState(questionCount);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'normal' | 'hard' | null>(null);
  
  // 管理者パネルアクセスをログに記録
  React.useEffect(() => {
    if (isOpen && isAdminEnabled()) {
      logAdminAccess('Admin panel opened');
    }
  }, [isOpen]);
  
  // 問題数の更新をメモ化
  const handleUpdateQuestionCount = useCallback(() => {
    if (questionInput < 1 || questionInput > 100) {
      setStatus('問題数は1-100の範囲で入力してください');
      return;
    }
    
    const oldCount = questionCount;
    setQuestionCount(questionInput);
    setStatus(`問題数を${questionInput}問に更新しました`);
    
    // 管理者操作をログに記録
    logAdminAccess('Question count updated', { 
      from: oldCount, 
      to: questionInput 
    });
    
    // 3秒後にステータスをクリア
    setTimeout(() => setStatus(''), 3000);
  }, [questionInput, questionCount, setQuestionCount]);

  // ランキングリセットの確認をメモ化
  const handleResetRankingConfirm = useCallback((mode: 'normal' | 'hard') => {
    setConfirmAction(mode);
    setShowConfirmModal(true);
  }, []);

  // ランキングリセットの実行をメモ化
  const handleResetRanking = useCallback(async () => {
    if (!confirmAction) return;
    
    setLoading(true);
    setShowConfirmModal(false);
    setStatus(`${confirmAction.toUpperCase()}ランキングをリセット中...`);
    
    try {
      const count = await deleteRankingEntriesByMode(confirmAction);
      setStatus(`${confirmAction.toUpperCase()}ランキングを${count}件リセットしました`);
    } catch (error) {
      console.error('Ranking reset error:', error);
      setStatus(`${confirmAction.toUpperCase()}ランキングリセットに失敗しました`);
    } finally {
      setLoading(false);
      setConfirmAction(null);
      // 3秒後にステータスをクリア
      setTimeout(() => setStatus(''), 3000);
    }
  }, [confirmAction]);
  
  // モーダルを閉じる処理をメモ化
  const handleClose = useCallback(() => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    onClose();
  }, [onClose]);

  // ESCキーでモーダルを閉じる処理をメモ化
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showConfirmModal) {
        setShowConfirmModal(false);
        setConfirmAction(null);
      } else {
        handleClose();
      }
    }
  }, [showConfirmModal, handleClose]);

  // Enterキーで問題数更新をメモ化
  const handleQuestionInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUpdateQuestionCount();
    }
  }, [handleUpdateQuestionCount]);

  // セキュリティチェック: 管理者パネルが有効かどうか確認
  if (!isAdminEnabled()) {
    showSecurityWarning();
    return null;
  }

  if (!isOpen) return null;

  return (
    <>
      {/* メイン管理者モーダル */}
      <div 
        className={styles.adminModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div 
          className={styles.adminModal__overlay}
          onClick={handleClose}
        />
        
        <div className={styles.adminModal__container}>
          <header className={styles.adminModal__header}>
            <h1 id="admin-modal-title" className={styles.adminModal__title}>
              ADMIN PANEL
            </h1>
            <button
              className={styles.adminModal__closeButton}
              onClick={handleClose}
              aria-label="管理パネルを閉じる"
              type="button"
            >
              ×
            </button>
          </header>

          <div className={styles.adminModal__content}>
            {/* 問題数設定セクション */}
            <section className={styles.adminModal__section}>
              <h2 className={styles.adminModal__sectionTitle}>
                問題数設定
              </h2>
              <div className={styles.adminModal__inputGroup}>
                <label className={styles.adminModal__label}>
                  現在の問題数: {questionCount}問
                </label>
                <div className={styles.adminModal__inputRow}>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(Number(e.target.value))}
                    onKeyDown={handleQuestionInputKeyDown}
                    className={styles.adminModal__input}
                    disabled={loading}
                    aria-label="新しい問題数"
                  />
                  <button
                    onClick={handleUpdateQuestionCount}
                    disabled={loading || questionInput < 1 || questionInput > 100}
                    className={styles.adminModal__button}
                    type="button"
                  >
                    更新
                  </button>
                </div>
              </div>
            </section>

            {/* デンジャーゾーン */}
            <section className={styles.adminModal__dangerZone}>
              <h2 className={styles.adminModal__dangerTitle}>
                🚨 DANGER ZONE
              </h2>
              <p className={styles.adminModal__dangerDescription}>
                以下の操作は元に戻すことができません。慎重に実行してください。
              </p>
              
              <div className={styles.adminModal__dangerActions}>
                <button
                  onClick={() => handleResetRankingConfirm('normal')}
                  disabled={loading}
                  className={styles.adminModal__dangerButton}
                  type="button"
                >
                  NORMALランキングリセット
                </button>
                <button
                  onClick={() => handleResetRankingConfirm('hard')}
                  disabled={loading}
                  className={styles.adminModal__dangerButton}
                  type="button"
                >
                  HARDランキングリセット
                </button>
              </div>
            </section>

            {/* ステータス表示 */}
            {status && (
              <div 
                className={styles.adminModal__status}
                role="status"
                aria-live="polite"
              >
                {status}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 確認モーダル */}
      {showConfirmModal && confirmAction && (
        <div 
          className={styles.confirmModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div 
            className={styles.confirmModal__overlay}
            onClick={() => setShowConfirmModal(false)}
          />
          
          <div className={styles.confirmModal__container}>
            <h2 id="confirm-modal-title" className={styles.confirmModal__title}>
              確認
            </h2>
            <p className={styles.confirmModal__message}>
              {confirmAction.toUpperCase()}モードのランキングを完全にリセットしますか？
              <br />
              <strong>この操作は元に戻すことができません。</strong>
            </p>
            
            <div className={styles.confirmModal__actions}>
              <button
                onClick={() => setShowConfirmModal(false)}
                className={styles.confirmModal__cancelButton}
                type="button"
              >
                キャンセル
              </button>
              <button
                onClick={handleResetRanking}
                className={styles.confirmModal__confirmButton}
                type="button"
                disabled={loading}
              >
                {loading ? 'リセット中...' : 'リセット実行'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>  );
});

AdminModal.displayName = 'AdminModal';

export default AdminModal;
