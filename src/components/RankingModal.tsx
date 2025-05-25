'use client';

import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/styles/RankingModal.module.css';

interface RankingModalProps {
  show: boolean;
  name: string;
  registering: boolean;
  done: boolean;
  error: string;
  isScoreRegistered: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChangeName: (name: string) => void;
  onClose: () => void;
}

/**
 * ランキング登録用モーダルコンポーネント
 */
export default function RankingModal({
  show,
  name,
  registering,
  done,
  error,
  isScoreRegistered,
  onSubmit,
  onChangeName,
  onClose
}: RankingModalProps) {
  if (!show || typeof window === 'undefined') return null;

  return createPortal(
    <div className={styles.overlay}>
      <AnimatePresence mode="wait">
        <motion.div
          key={done ? 'done' : 'form'}
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          layout
        >
          <h3 className={styles.title}>ランキング登録</h3>
          {done ? (
            <div className={styles.doneContainer}>
              <div className={styles.successMessage}>登録が完了しました！</div>
              <button 
                onClick={onClose} 
                className={styles.closeButton}
              >
                閉じる
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={onSubmit}>
              <input
                type="text"
                placeholder="名前を入力（10文字以内）"
                maxLength={10}
                value={name}
                onChange={e => onChangeName(e.target.value)}
                className={styles.input}
                disabled={registering || isScoreRegistered}
              />
              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={registering || !name.trim() || isScoreRegistered}
                >
                  {registering ? '登録中...' : '登録する'}
                </button>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <button 
                  type="button" 
                  onClick={onClose} 
                  className={styles.cancelButton}
                >
                  キャンセル
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
