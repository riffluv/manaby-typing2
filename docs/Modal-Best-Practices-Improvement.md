/**
 * モーダル管理のベストプラクティス改善案
 * 
 * 現在の実装は既に優秀ですが、以下の改善でさらにモダンになります：
 */

// 1. ポータルを使用したモーダル（推奨）
import { createPortal } from 'react-dom';

// 2. フォーカス管理とアクセシビリティ強化
import { useEffect, useRef } from 'react';

// 3. エスケープキー処理の統一
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';

/**
 * 改善版ランキングモーダル（提案）
 */
const ImprovedRankingModal: React.FC<RankingModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  isLoading 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // フォーカストラップ（アクセシビリティ）
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstFocusableElement = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusableElement?.focus();
    }
  }, [isOpen]);
  
  // ESCキーでモーダル閉じる
  useGlobalShortcuts([
    {
      key: 'Escape',
      handler: (e) => {
        if (isOpen) {
          e.preventDefault();
          onClose();
        }
      },
    },
  ], [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  // ポータルを使用してbody直下にレンダリング
  return createPortal(
    <div 
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className={styles.modalTitle}>
          Enter Your Name
        </h2>
        {/* フォーム内容 */}
      </div>
    </div>,
    document.body
  );
};
