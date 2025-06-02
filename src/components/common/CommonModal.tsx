import React, { useEffect, useRef } from 'react';
import styles from './CommonModal.bem.module.css';

interface CommonModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  closeButton?: boolean;
}

const CommonModal: React.FC<CommonModalProps> = ({
  open,
  onClose,
  children,
  className = '',
  overlayClassName = '',
  closeButton = true,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className={[styles.modal__overlay, overlayClassName].filter(Boolean).join(' ')}
      ref={overlayRef}
      onClick={e => {
        if (e.target === overlayRef.current) onClose();
      }}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <div className={[styles.modal__container, className].filter(Boolean).join(' ')}>
        {closeButton && (
          <button
            className={styles.modal__closeButton}
            onClick={onClose}
            aria-label="閉じる"
            type="button"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default CommonModal;
